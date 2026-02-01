import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ShieldUser } from "lucide-react";

const menu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
];

export default function AdminSidebar() {
  return (
    <aside className="w-70 bg-gray-900 text-gray-200">
      <div className="flex items-center justify-center pt-4">
        <div>
          <ShieldUser className="h-12 w-12" />
        </div>
        <div className="flex flex-col">
          <div className="px-2 text-md font-bold text-white">Admin Panel</div>
          <div className="px-2 text-sm font-semibold text-white">System Administration</div>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1 px-3">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                 ${isActive ? "bg-amber-600 text-white" : "text-gray-200 hover:bg-gray-800"}`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
