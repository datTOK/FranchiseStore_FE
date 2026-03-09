import { ChefHat, CirclePile, LayoutDashboard, LogOut, NotepadText, User, PackageOpen, ReceiptText, Boxes, Factory,  } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import { doLogout } from "../app/auth/logout";

const menu = [
  { label: "Dashboard", path: "/ck-staff/dashboard", icon: LayoutDashboard },
  { label: "Inventory Product", path: "/ck-staff/inventory", icon: CirclePile },
  { label: "Inventory Material", path: "/ck-staff/material-inventory", icon: Boxes },
  { label: "Orders", path: "/ck-staff/orders", icon: NotepadText },
  { label: "Reservations", path: "/ck-staff/reservations", icon: ClipboardCheck },
  {
    label: "Production Orders",
    path: "/ck-staff/production-orders",
    icon: Factory,
  },
  {
    label: "Goods Receipt Material",
    path: "/ck-staff/goods-receipt-materials",
    icon: ReceiptText,
  },
  { label: "Goods Issue", path: "/ck-staff/goods-issues", icon: PackageOpen },
  { label: "Profile", path: "/ck-staff/profile", icon: User },
];

export default function CKStaffSidebar() {
  // const navigate = useNavigate();

  return (
    <aside className="h-full w-[260px] bg-zinc-900 text-zinc-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 px-6 pt-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800">
            <ChefHat className="h-6 w-6 text-amber-300" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Central Kitchen</div>
            <div className="text-xs font-medium text-zinc-400">CK Staff Portal</div>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-2 px-4">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-300 hover:bg-zinc-800/70 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 text-zinc-400 transition group-hover:text-amber-300" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-800 p-4">
        <button
          type="button"
          onClick={() => doLogout()}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800/70 hover:text-white"
        >
          <LogOut className="h-5 w-5 text-zinc-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}