import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./auth/login/LoginPage";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard/Dashboard";
import Users from "./admin/Users/Users";

import StaffLayout from "./staff/StaffLayout";
import StaffDashboard from "./staff/StaffDashboard/StaffDashboard";
import StaffInventory from "./staff/StaffInventory/StaffInventory";
import StaffOrder from "./staff/StaffOrder/StaffOrder";
import StaffProfile from "./staff/StaffProfile/StaffProfile";
import CentralKitchenLayout from "./central_kitchen/CentralKitchenLayout";
import KitchenDashboard from "./central_kitchen/KitchenDashboard/KitchenDashboard";
import ManagerDashboard from "./manager/ManagerDashboard/ManagerDashboard";
import ManagerLayout from "./manager/ManagerLayout";
import ManagerReports from "./manager/ManagerReports/ManagerReports";
import SupplyCordinatorLayout from "./supply_cordinator/SupplyCordinatorLayout";
import SupplyCordinatorDashboard from "./supply_cordinator/SupplyCordinatorDashboard/SupplyCordinatorDasboard";
import KitchenProduction from "./central_kitchen/KitchenProduction/KitchenProduction";
import Category from "./admin/Category/Category";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Category />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        { }
        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="order" element={<StaffOrder />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="/central-kitchen" element={<CentralKitchenLayout />}>
          <Route path="dashboard" element={<KitchenDashboard />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="production" element={<KitchenProduction />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="report" element={<ManagerReports />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="/supply-cordinator" element={<SupplyCordinatorLayout />}>
          <Route path="dashboard" element={<SupplyCordinatorDashboard />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="report" element={<ManagerReports />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ROOT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<div className="p-6">404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
