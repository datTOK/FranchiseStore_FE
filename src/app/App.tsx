import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './auth/login/LoginPage'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard/Dashboard'
import { Users } from 'lucide-react'
import StaffDashboard from './staff/StaffDashboard/StaffDashboard'
import StaffLayout from './staff/StaffLayout'
import StaffInventory from './staff/StaffInventory/StaffInventory'
import StaffOrder from './staff/StaffOrder/StaffOrder'
// import Register from './auth/register/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/signup" element={<Register />} /> */}
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/admin/users" element={<AdminLayout />}>
          <Route index element={<Users />} />
        </Route>
        <Route path="/staff/dashboard" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
        </Route>
        <Route path="/staff/inventory" element={<StaffLayout />}>
          <Route index element={<StaffInventory />} />
        </Route>
        <Route path="/staff/order" element={<StaffLayout />}>
          <Route index element={<StaffOrder />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
