import { Outlet } from "react-router-dom";
import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";

import bg from "../../assets/staff-bg.jpg";

export default function StaffLayout() {
  return (
    <div className="flex min-h-screen w-full bg-zinc-100">
      <StaffSidebar />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bg})` }}
        />

        


        <div className="relative z-10 flex flex-1 flex-col">
          <StaffHeader />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
