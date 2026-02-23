import { ChefHat, CirclePile, LayoutDashboard, LogOut, NotepadText, User } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

const menu = [
  { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/staff/inventory', icon: CirclePile },
  { label: 'Orders', path: '/staff/order', icon: NotepadText },
  { label: 'Profile', path: '/staff/profile', icon: User },
]

export default function StaffSidebar() {
  const navigate = useNavigate()

  return (
    <aside className="flex w-[260px] flex-col bg-zinc-900 text-zinc-200">
      <div className="flex items-center gap-3 px-6 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800">
          <ChefHat className="h-6 w-6 text-amber-300" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Franchise Store</div>
          <div className="text-xs font-medium text-zinc-400">Franchise Portal</div>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2 px-4">
        {menu.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white',
                ].join(' ')
              }
            >
              <Icon className="h-5 w-5 text-zinc-400 transition group-hover:text-amber-300" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800/70 hover:text-white"
        >
          <LogOut className="h-5 w-5 text-zinc-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
