import { useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import axiosClient from "../../../api/axiosClient"
import { useNavigate } from "react-router-dom"

type Role = "ADMIN" | "STAFF" | "CUSTOMER"

type Store = {
  id: string
  name: string
  address: string
  phone?: string
}

type UserProfile = {
  id: string
  name: string
  email: string
  role: Role
  store?: Store | null
}

const mockUser: UserProfile = {
  id: "u01",
  name: "thai",
  email: "thai2026@gmail.com",
  role: "STAFF",
  store: {
    id: "S-01",
    name: "Franchise Store - CN1",
    address: "123 ABC, Quận 1, TP.HCM",
    phone: "0123456789",
  },
}

const ROLE_PERMISSIONS: Record<Role, { label: string; desc?: string }[]> = {
  ADMIN: [
    { label: "Quản lý người dùng" },
    { label: "Quản lý cửa hàng" },
    { label: "Quản lý sản phẩm" },
    { label: "Quản lý đơn hàng" },
    { label: "Xem báo cáo" },
  ],
  STAFF: [
    { label: "Quản lý sản phẩm" },
    { label: "Quản lý đơn hàng" },
    { label: "Xem thông tin cửa hàng" },
  ],
  CUSTOMER: [
    { label: "Xem sản phẩm" },
    { label: "Đặt hàng" },
    { label: "Xem đơn hàng" },
    { label: "Đổi mật khẩu" },
  ],
}

export default function StaffProfile() {
  const navigate = useNavigate()
  const [user] = useState<UserProfile>(mockUser)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const canViewStore = user.role === "ADMIN" || user.role === "STAFF"
  const permissions = useMemo(() => ROLE_PERMISSIONS[user.role] ?? [], [user.role])

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg("")

    if (!oldPassword || !newPassword || !confirm) {
      setMsg("Vui lòng nhập đầy đủ thông tin.")
      return
    }
    if (newPassword.length < 6) {
      setMsg("Mật khẩu mới tối thiểu 6 ký tự.")
      return
    }
    if (newPassword !== confirm) {
      setMsg("Xác nhận mật khẩu không khớp.")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setMsg("❌ Không có token. Bạn cần đăng nhập lại.")
        setLoading(false)
        return
      }

      const res = await axiosClient.post("/auth/change-password", {
        oldPassword,
        newPassword,
      })

      const serverMsg = res?.data?.message || "Password changed successfully"
      setMsg("✅ " + serverMsg + ". Vui lòng đăng nhập lại.")

      setOldPassword("")
      setNewPassword("")
      setConfirm("")

      setTimeout(() => {
        localStorage.removeItem("accessToken")
        navigate("/login")
      }, 1200)
    } catch (err: any) {
      const status = err?.response?.status
      const data = err?.response?.data
      const serverMsg =
        data?.message ||
        data?.error ||
        err?.message ||
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
        <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
        <p className="text-sm text-gray-500">
          Đổi mật khẩu • Cửa hàng • Quyền hạn (read-only)
        </p>
      </div>

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
                <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Role: {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-gray-900">Quyền hạn (read-only)</div>
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
              Quyền được hiển thị theo role. Không chỉnh sửa tại trang này.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
              <div className="text-base font-semibold text-gray-900">Thông tin cửa hàng</div>
              <div className="text-xs text-gray-500">Read-only theo role</div>
            </div>

            {!canViewStore ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Bạn không có quyền xem cửa hàng. (Chỉ STAFF/ADMIN)
              </div>
            ) : user.store ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Mã cửa hàng</div>
                  <div className="font-semibold text-gray-900">{user.store.id}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Tên cửa hàng</div>
                  <div className="font-semibold text-gray-900">{user.store.name}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                  <div className="text-xs text-gray-500">Địa chỉ</div>
                  <div className="font-semibold text-gray-900">{user.store.address}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Số điện thoại</div>
                  <div className="font-semibold text-gray-900">{user.store.phone ?? "-"}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Chưa có cửa hàng được gán.
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
              <div className="text-base font-semibold text-gray-900">Đổi mật khẩu</div>
              <div className="text-xs text-gray-500">Tối thiểu 6 ký tự</div>
            </div>

            {msg ? (
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {msg}
              </div>
            ) : null}

            <form onSubmit={onChangePassword} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? "text" : "password"}
                    className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Tối thiểu 6 ký tự"
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Nhập lại mật khẩu"
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
                  {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
