import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './auth/login/LoginPage'
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
