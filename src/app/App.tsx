import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './auth/login/LoginPage'
import Register from './auth/register/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
