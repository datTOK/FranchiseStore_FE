import { Album, ChefHat, CirclePile, LayoutDashboard, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menu = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Category', path: '/manager/category', icon: Album },
    { label: 'Products', path: '/manager/products', icon: CirclePile },
    { label: 'Product Recipes', path: '/manager/product-recipes', icon: CirclePile },
    { label: 'Materials', path: '/manager/materials', icon: CirclePile },
    { label: "Profile", path: "/manager/profile", icon: User }
]

export default function ManagerSidebar() {
    return (
        <aside className="w-70 bg-gray-900 text-gray-200">
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
                                    ? 'bg-amber-600 text-white'
                                    : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`
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

