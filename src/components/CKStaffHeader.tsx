import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import axiosClient from "./../api/axiosClient" 
import { doLogout } from "../app/auth/logout";

export default function StaffHeader() {
  const navigate = useNavigate()
  type Me = { id?: number; name?: string; role?: string; username?: string }
  const [me, setMe] = useState<Me | null>(null)

useEffect(() => {
  const fetchMe = async () => {
    try {
      const res = await axiosClient.get("/auth/me")
      const outer = (res as { data?: unknown }).data as unknown
      const user =
        ((outer as { data?: Me }).data) ??
        ((outer as { user?: Me }).user) ??
        (outer as Me | null) ??
        null
      setMe(user)
    } catch {
      setMe(null)
    }
  }
  fetchMe()
}, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-zinc-100/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-zinc-100/60">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-semibold text-zinc-900">Franchise Store Staff</h1>
        <span className="hidden text-xs font-medium text-zinc-500 sm:inline">Overview</span>
      </div>

      <div className="relative group">
        <div className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/70">
          <img
            src="https://i.pravatar.cc/100"
            alt="Staff Avatar"
            className="h-9 w-9 rounded-full border-2 border-amber-300 object-cover"
          />
          <span className="hidden text-sm font-medium text-zinc-800 sm:block">
  {me?.name || "User"}
</span>
        </div>

        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-zinc-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="px-4 py-3 border-b border-zinc-100">
            <div className="text-sm font-semibold text-zinc-900">
  {me?.role || "Staff"}
</div>
            <div className="text-xs text-zinc-500 truncate">
  {me?.username || ""}
</div>
          </div>

          <div className="p-2">
            
            <button
              type="button"
              onClick={() => navigate('/staff/profile')}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
            >
              Profile
            </button>
            <button
    type="button"
    onClick={() => doLogout()}
    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
  >
    Logout
  </button>
          </div>
        </div>
      </div>
    </header>
  )
}
