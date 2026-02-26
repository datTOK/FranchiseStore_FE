import { Outlet } from "react-router-dom";
import CKStaffSidebar from "../../components/CKStaffSidebar";
import CKStaffHeader from "../../components/CKStaffHeader";
import bg from "../../assets/staff-bg.jpg";

export default function CKStaffLayout() {
  return (
    <div className="min-h-screen w-full bg-zinc-100">
      {/* Sidebar fixed */}
      <div className="fixed left-0 top-0 h-screen w-[260px] z-40">
        <CKStaffSidebar />
      </div>

      {/* Content area (chừa chỗ sidebar) */}
      <div className="ml-[260px] min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bg})` }}
        />

        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Header cố định trên top */}
          <div className="sticky top-0 z-30">
            <CKStaffHeader />
          </div>

          {/* Chỉ main cuộn */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}