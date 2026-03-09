import RequireAuth from "./auth/RequireAuth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./auth/login/LoginPage";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard/Dashboard";
import Users from "./admin/Users/Users";
// CK Staff (Central Kitchen Staff)
import CKStaffLayout from "./staff/CKStaffLayout";
import CKStaffDashboard from "./staff/CKStaffDashboard/CKStaffDashboard";
import CKStaffInventory from "./staff/CKStaffInventory/CKStaffInventory";
import CKStaffOrder from "./staff/CKStaffOrder/CKStaffOrder";
import CKStaffProfile from "./staff/CKStaffProfile/CKStaffProfile";
import CKStaffReservations from "./staff/CKStaffReservations/CKStaffReservations";
import CKStaffGoodsIssue from "./staff/CKStaffGoodsIssue/CKStaffGoodsIssue";
import CKStaffGoodsReceiptMaterial from "./staff/CKStaffGoodsReceiptMaterial/CKStaffGoodsReceiptMaterial";

// FR Staff (Franchise Store Staff)
import FRStaffLayout from "./fr_staff/FRStaffLayout";
import FRStaffDashboard from "./fr_staff/FRStaffDashboard/FRStaffDashboard";
import FRStaffInventory from "./fr_staff/FRStaffInventory/FRStaffInventory";
import FRStaffOrder from "./fr_staff/FRStaffOrder/FRStaffOrder";
import FRStaffGoodsReceipt from "./fr_staff/FRStaffGoodsReceipt/FRStaffGoodsReceipt";
import FRStaffProfile from "./fr_staff/FRStaffProfile/FRStaffProfile";
import CentralKitchenLayout from "./central_kitchen/CentralKitchenLayout";
import KitchenDashboard from "./central_kitchen/KitchenDashboard/KitchenDashboard";
import ManagerDashboard from "./manager/ManagerDashboard/ManagerDashboard";
import ManagerLayout from "./manager/ManagerLayout";
import ManagerReports from "./manager/ManagerReports/ManagerReports";
import SupplyCordinatorLayout from "./supply_cordinator/SupplyCordinatorLayout";
import SupplyCordinatorDashboard from "./supply_cordinator/SupplyCordinatorDashboard/SupplyCordinatorDasboard";
import KitchenProduction from "./central_kitchen/KitchenProduction/KitchenProduction";
import Category from "./admin/Category/Category";
import { Toaster } from "react-hot-toast";
import Store from "./admin/Store/Store";
import ManagerCategory from "./manager/ManagerCategory/ManagerCategory";
import ManagerProducts from "./manager/ManagerProducts/ManagerProducts";
import ManagerProfile from "./manager/ManagerProfile/ManagerProfile";
import CKStaffMaterialInventory from "./staff/CKStaffMaterialInventory/CKStaffMaterialInventory";
import CKStaffProductionOrders from "./staff/CKStaffProductionOrders/CKStaffProductionOrders";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
  {/* AUTH */}
  <Route path="/login" element={<LoginPage />} />

  {/* PRIVATE: phải login mới vào được */}
  <Route element={<RequireAuth />}>
    {/* ADMIN */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="categories" element={<Category />} />
      <Route path="stores" element={<Store />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    {/* CK STAFF */}
    <Route path="/ck-staff" element={<CKStaffLayout />}>
      <Route path="dashboard" element={<CKStaffDashboard />} />
      <Route path="inventory" element={<CKStaffInventory />} />
      <Route path="material-inventory" element={<CKStaffMaterialInventory />} />
      <Route path="orders" element={<CKStaffOrder />} />
      <Route path="reservations" element={<CKStaffReservations />} />
      <Route path="production-orders" element={<CKStaffProductionOrders />} />
      <Route path="goods-receipt-materials" element={<CKStaffGoodsReceiptMaterial />} />
      <Route path="goods-issues" element={<CKStaffGoodsIssue />} />
      <Route path="profile" element={<CKStaffProfile />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    
    </Route>

    {/* FR STAFF */}
    <Route path="/fr-staff" element={<FRStaffLayout />}>
      <Route path="dashboard" element={<FRStaffDashboard />} />
      <Route path="inventory" element={<FRStaffInventory />} />
      <Route path="orders" element={<FRStaffOrder />} />
      <Route path="goods-receipts" element={<FRStaffGoodsReceipt />} />
      <Route path="profile" element={<FRStaffProfile />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    {/* backward compatible (old staff paths) */}
    <Route path="/staff" element={<Navigate to="/ck-staff" replace />} />
    <Route path="/staff/*" element={<Navigate to="/ck-staff" replace />} />

    <Route path="/central-kitchen" element={<CentralKitchenLayout />}>
      <Route path="dashboard" element={<KitchenDashboard />} />
      <Route path="inventory" element={<CKStaffInventory />} />
      <Route path="production" element={<KitchenProduction />} />
      <Route path="profile" element={<CKStaffProfile />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    <Route path="/manager" element={<ManagerLayout />}>
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="category" element={<ManagerCategory />} />
      <Route path="products" element={<ManagerProducts />} />
      <Route path="profile" element={<ManagerProfile />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

    <Route path="/supply-cordinator" element={<SupplyCordinatorLayout />}>
      <Route path="dashboard" element={<SupplyCordinatorDashboard />} />
      <Route path="inventory" element={<CKStaffInventory />} />
      <Route path="report" element={<ManagerReports />} />
      <Route path="profile" element={<CKStaffProfile />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>
  </Route>

  {/* ROOT */}
  <Route path="/" element={<Navigate to="/login" replace />} />

  {/* 404 */}
  <Route path="*" element={<div className="p-6">404 - Not Found</div>} />
</Routes>
    </BrowserRouter>
  );
}