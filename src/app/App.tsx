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
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {}
        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="order" element={<StaffOrder />} />
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
