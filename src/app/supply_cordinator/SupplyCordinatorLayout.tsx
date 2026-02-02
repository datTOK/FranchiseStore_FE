import { Outlet } from "react-router-dom";
import SupplyCordinatorSidebar from "../../components/SupplyCordinatorSidebar";
import SupplyCordinatorHeader from "../../components/SupplyCordinatorHeader";

export default function SupplyCordinatorLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <SupplyCordinatorSidebar />

      <div className="flex flex-1 flex-col">
        <SupplyCordinatorHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
