import { Outlet } from "react-router-dom";
import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";

export default function StaffLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />

      <div className="flex flex-1 flex-col">
        <StaffHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
