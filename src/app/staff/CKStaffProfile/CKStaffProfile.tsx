import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import axiosClient from "../../../api/axiosClient"
import { useNavigate } from "react-router-dom"

type Role = "ADMIN" | "CK_STAFF" | "FR_STAFF" | "MANAGER" | string

type MeUser = {
  id: number
  role: Role
  name?: string
  username?: string
  phone?: string
  dob?: string
  store_id?: number
}

type StoreMe = {
  id: number
  type?: string
  name?: string
  address?: string
}



const ROLE_PERMISSIONS: Record<string, { label: string }[]> = {
  ADMIN: [
    { label: "Manage users" },
    { label: "Manage stores" },
    { label: "Manage products" },
    { label: "Manage orders" },
    { label: "View reports" },
  ],
  CK_STAFF: [
    { label: "Process store orders" },
    { label: "Manage central kitchen inventory" },
    { label: "Goods issue (export to stores)" },
  ],
  FR_STAFF: [
    { label: "View store inventory" },
    { label: "Create orders to central kitchen" },
    { label: "Goods receipt (receive from central kitchen)" },
  ],
  MANAGER: [
    { label: "View dashboard" },
    { label: "Manage products" },
    { label: "View reports" },
  ],
}

export default function StaffProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<MeUser | null>(null)
const [store, setStore] = useState<StoreMe | null>(null)
const [loadingProfile, setLoadingProfile] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const roleKey = String(user?.role ?? "").toUpperCase().trim()
const permissions = useMemo(() => ROLE_PERMISSIONS[roleKey] ?? [], [roleKey])

const refreshProfile = async () => {
  try {
    setLoadingProfile(true)


   const meRes = await axiosClient.get("/auth/me")
const meRaw = (meRes as { data?: unknown }).data as unknown
const meObj =
  ((meRaw as { data?: MeUser }).data) ??
  ((meRaw as { user?: MeUser }).user) ??
  (meRaw as MeUser | null) ??
  null

console.log("AUTH_ME_RAW:", meRes?.data)
console.log("AUTH_ME_OBJ:", meObj)

setUser(meObj)

    try {
      const sRes = await axiosClient.get("/stores/me")
const sRaw = (sRes as { data?: unknown }).data as unknown
const sObj =
  ((sRaw as { data?: StoreMe }).data) ??
  (sRaw as StoreMe | null) ??
  null

console.log("STORES_ME_RAW:", sRes?.data)
console.log("STORES_ME_OBJ:", sObj)

setStore(sObj)
    } catch {
      setStore(null)
    }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } }; message?: string }
    setMsg("❌ " + (e?.response?.data?.message || e?.message || "Failed to load profile"))
  } finally {
    setLoadingProfile(false)
  }
}

useEffect(() => {
  refreshProfile()
}, [])

  

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg("")

    if (!oldPassword || !newPassword || !confirm) {
      setMsg("❌ Please fill in all fields.")
      return
    }
    if (newPassword.length < 6) {
      setMsg("❌ New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirm) {
      setMsg("❌ Confirm password does not match.")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setMsg("❌ Missing token. Please login again.")
        setLoading(false)
        return
      }

      const res = await axiosClient.post("/auth/change-password", {
        oldPassword,
        newPassword,
      })

      const serverMsg = res?.data?.message || "Password changed successfully"
      setMsg("✅ " + serverMsg + ". Please login again.")

      setOldPassword("")
      setNewPassword("")
      setConfirm("")

      setTimeout(() => {
        localStorage.removeItem("accessToken")
        navigate("/login")
      }, 1200)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string; error?: string } }; message?: string }
      const status = e?.response?.status
      const data = e?.response?.data
      const serverMsg =
        data?.message ||
        data?.error ||
        e?.message ||
        "Internal server error"

      setMsg(`❌ (${status || "?"}) ${String(serverMsg)}`)

      console.log("CHANGE_PASSWORD_ERROR_STATUS:", status)
      console.log("CHANGE_PASSWORD_ERROR_DATA:", data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        

      </div>
      {loadingProfile ? (
  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
    Loading profile...
  </div>
) : null}

{msg ? (
  <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
    {msg}
  </div>
) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/100"
                className="h-14 w-14 rounded-full border-2 border-amber-500 object-cover"
                alt="avatar"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">{user?.name || "-"}</div>
<div className="text-sm text-gray-500">Username: {user?.username || "-"}</div>
<div className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
  Role: {roleKey || "-"}
</div>
<div className="mt-2 text-xs text-gray-500">Store ID: {user?.store_id ?? "-"}</div>
<div className="mt-1 text-xs text-gray-500">DOB: {user?.dob ? new Date(user.dob).toLocaleDateString() : "-"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-gray-900">Permissions (read-only)</div>
            <div className="flex flex-wrap gap-2">
              {permissions.map((p, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {p.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
             
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
  <div className="text-base font-semibold text-gray-900">Store Information</div>
  <div className="text-xs text-gray-500">Read-only</div>
</div>

{store ? (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-xs text-gray-500">Store ID</div>
      <div className="font-semibold text-gray-900">{store.id}</div>
    </div>
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-xs text-gray-500">Store Name</div>
      <div className="font-semibold text-gray-900">{store.name || "-"}</div>
    </div>
    <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
      <div className="text-xs text-gray-500">Address</div>
      <div className="font-semibold text-gray-900">{store.address || "-"}</div>
    </div>
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-xs text-gray-500">Phone</div>
      <div className="font-semibold text-gray-900">{user?.phone || "-"}</div>
    </div>
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-xs text-gray-500">Store Type</div>
      <div className="font-semibold text-gray-900">{store.type || "-"}</div>
    </div>
  </div>
) : (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
    No store information found for this account.
  </div>
)}
              
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
              <div className="text-base font-semibold text-gray-900">Change Password</div>
              
            </div>

            {msg ? (
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {msg}
              </div>
            ) : null}

            <form onSubmit={onChangePassword} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Current password</label>
                <div className="relative">
                  <input
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    type={showOld ? "text" : "password"}
                    className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100"
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? "text" : "password"}
                    className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                <div className="relative">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
