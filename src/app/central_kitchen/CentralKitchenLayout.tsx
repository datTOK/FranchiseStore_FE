import { Outlet } from "react-router-dom";
import CentralKitchenSidebar from "../../components/CentralKitchenSidebar";
import CentralKitchenHeader from "../../components/CentralKitchenHeader";

export default function CentralKitchenLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <CentralKitchenSidebar />

      <div className="flex flex-1 flex-col">
        <CentralKitchenHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
