import { ChefHat, CirclePile, LayoutDashboard, NotepadText, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menu = [
    { label: 'Dashboard', path: '/central-kitchen/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', path: '/central-kitchen/inventory', icon: CirclePile },
    { label: 'Production', path: '/central-kitchen/production', icon: NotepadText },
    { label: "Profile", path: "/central-kitchen/profile", icon: User }

]

export default function CentralKitchenSidebar() {
    return (
        <aside className="w-70 bg-amber-600 text-gray-200">
            <div className='flex items-center justify-center pt-4'>
                <div>
                    <ChefHat className='w-12 h-12' />
                </div>
                <div className='flex flex-col '>
                    <div className="px-2 text-md font-bold text-white">
                        Franchise Store
                    </div>
                    <div className="px-2 text-sm font-semibold text-white">
                        Franchise Portal
                    </div>
                </div>
            </div>

            <nav className="mt-8 flex flex-col gap-1 px-3">
                {menu.map(item => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-4 py-6 text-sm transition
                ${isActive
                                    ? 'bg-amber-900 text-white'
                                    : 'text-gray-300 hover:bg-amber-800 hover:text-white'}`
                            }
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>
        </aside>
    )
}

