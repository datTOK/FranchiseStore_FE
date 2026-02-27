import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import axiosClient from "../api/axiosClient"
import type { Users } from "../types/users.type"

export default function ManagerHeader() {
  const navigate = useNavigate()
  const [user, setUser] = useState<Users | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get("/auth/me")
        setUser(res.data.data)
      } catch {
        navigate("/login")
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("idToken")

    toast.success("Logged out successfully 👋")

    navigate("/login")
  }

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? "M"

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">Manager</h1>

      <div className="relative group">
        <div className="flex items-center justify-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold border-2 border-amber-600">
            {avatarLetter}
          </div>

          <span className="block text-sm font-medium text-gray-800">
            {user?.name ?? "Loading..."}
          </span>
        </div>

        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="block text-sm font-semibold text-gray-800">
              {user?.role ?? "Role"}
            </span>
            <span className="block text-sm text-gray-500 truncate">
              @{user?.username}
            </span>
          </div>

          <ul className="py-1">
            <li>
              <button
                onClick={() => navigate("/manager/dashboard")}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Quản lý hệ thống
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate("/manager/profile")}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Hồ sơ cá nhân
              </button>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}