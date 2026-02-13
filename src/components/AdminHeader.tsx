import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function AdminHeader() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("idToken")

    toast.success("Logged out successfully 👋")

    navigate("/login")
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>

      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <span className="text-sm text-gray-600">Admin</span>

          <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-700">
            A
          </div>
        </div>

        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl border bg-white shadow-lg overflow-hidden z-50">
            <button
              onClick={() => {
                setOpen(false)
                navigate("/admin/profile")
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

