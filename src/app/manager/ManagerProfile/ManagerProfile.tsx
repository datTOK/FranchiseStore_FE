import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import axiosClient from "../../../api/axiosClient"
import { useNavigate } from "react-router-dom"
import LoadingLottie from "../../../components/LoadingLottie"
import type { Role, UserProfile } from "../../../types/users.type"
import type { Store } from "../../../types/store.type"
import { getAxiosErrorMessage } from "../../../utils/getAxiosErrorMessage"

const ROLE_PERMISSIONS: Record<Role, string[]> = {
    ADMIN: [
        "Manage Users",
        "Manage Stores",
        "Manage Products",
        "View Reports",
    ],
    MANAGER: [
        "Manage Products",
        "Manage Staff",
        "View Store Information",
    ],
    FR_STAFF: ["Manage Orders", "View Store Info"],
    CK_STAFF: ["Manage Kitchen Products"],
    SC_COORDINATOR: ["Coordinate Supply Chain"],
}

export default function ManagerProfile() {
    const navigate = useNavigate()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [store, setStore] = useState<Store | null>(null)
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const permissions = useMemo(() => {
        if (!user) return []
        return ROLE_PERMISSIONS[user.role] ?? []
    }, [user])

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/auth/me")
                const userData = res.data.data

                setUser(userData)

                if (userData.store_id) {
                    const storeRes = await axiosClient.get(
                        `/stores/${userData.store_id}`
                    )
                    setStore(storeRes.data.data)
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err)
                navigate("/login")
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [navigate])

    const onChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMsg("")

        if (!oldPassword || !newPassword || !confirm) {
            setMsg("❌ Please fill all fields.")
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

        try {
            await axiosClient.post("/auth/change-password", {
                oldPassword,
                newPassword,
            })

            setMsg("✅ Password changed successfully. Please login again.")

            setTimeout(() => {
                localStorage.removeItem("accessToken")
                localStorage.removeItem("user")
                navigate("/login")
            }, 1200)
        } catch (err: unknown) {
            const message = getAxiosErrorMessage(
                err,
                "Invalid old password or server error"
            )
            setMsg("❌ " + message)
        }
    }

    if (loading) return <LoadingLottie />

    if (!user) return null

    return (
        <div className="max-w-5xl">
            <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                    Manager Profile
                </h2>
                <p className="text-sm text-gray-500">
                    Account information • Store • Change password
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    @{user.username}
                                </div>
                                <div className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                    Role: {user.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-3 text-sm font-semibold text-gray-900">
                            Permissions (read-only)
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {permissions.map((p, idx) => (
                                <span
                                    key={idx}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                >
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-3">
                            <div className="text-base font-semibold text-gray-900">
                                Store Information
                            </div>
                            <div className="text-xs text-gray-500">
                                Linked to your account
                            </div>
                        </div>

                        {store ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <div className="text-xs text-gray-500">Store ID</div>
                                    <div className="font-semibold text-gray-900">
                                        {store.id}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <div className="text-xs text-gray-500">Store Type</div>
                                    <div className="font-semibold text-gray-900">
                                        {store.type}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                                    <div className="text-xs text-gray-500">Store Name</div>
                                    <div className="font-semibold text-gray-900">
                                        {store.name}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                                    <div className="text-xs text-gray-500">Address</div>
                                    <div className="font-semibold text-gray-900">
                                        {store.address}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                No store assigned.
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-3">
                            <div className="text-base font-semibold text-gray-900">
                                Change Password
                            </div>
                            <div className="text-xs text-gray-500">
                                Minimum 6 characters
                            </div>
                        </div>

                        {msg && (
                            <div className="mb-3 rounded-lg bg-gray-100 p-3 text-sm">
                                {msg}
                            </div>
                        )}

                        <form onSubmit={onChangePassword} className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showOld ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Current password"
                                    className="w-full rounded-lg border px-3 py-2 pr-10 focus:ring-2 focus:ring-amber-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOld(!showOld)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                    className="w-full rounded-lg border px-3 py-2 pr-10 focus:ring-2 focus:ring-amber-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full rounded-lg border px-3 py-2 pr-10 focus:ring-2 focus:ring-amber-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}