import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import axiosClient from '../../../api/axiosClient'
// import { Link } from 'react-router-dom'
// import '../../../components/login/Login.css'

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axiosClient.post('/auth/login', {
        username,
        password,
      })

      const data = response.data
      console.log('Login response:', data)
      
      const token = data.accessToken || data.token

      if (token) {
        localStorage.setItem('accessToken', token)
        
        try {
          const meResponse = await axiosClient.get('/auth/me')
          const userData = meResponse.data
          console.log('User info (/auth/me):', userData)
          
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData))
          }

          const userObj = userData.user || userData.data || userData
          const role = userObj.role || userData.role

          console.log('Extracted role:', role)

          const normalizedRole = role?.toString().toUpperCase().trim()
          
          if (normalizedRole === 'ADMIN') {
            navigate('/admin/dashboard')
          } else if (normalizedRole === 'STAFF') {
            navigate('/staff/dashboard')
          // } else {
          //   console.warn('Unknown or missing role from /auth/me. Raw data:', userData)
          //   alert(`Could not determine role. Detected: "${role}". Raw data: ${JSON.stringify(userData)}`)
          //   navigate('/login') 
          }
        } catch (meError) {
          console.error('Failed to fetch user info:', meError)
          
          const fallbackRole = data.role || data.user?.role
          const normalizedFallbackRole = fallbackRole?.toString().toUpperCase().trim()
          
          if (normalizedFallbackRole === 'ADMIN') {
             navigate('/admin/dashboard')
          } else if (normalizedFallbackRole === 'STAFF') {
             navigate('/staff/dashboard')
          } else {
             navigate('/staff/dashboard')
          }
        }

      } else {
        setError('Login failed: No access token received.')
      }
    } catch (err) {
      console.error('Login error:', err)
      if (axios.isAxiosError(err) && err.response) {
         setError(err.response.data?.message || 'Login failed. Please check your credentials.')
      } else {
         setError('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff7f2] text-slate-900 md:flex-row">
      <div className="hidden h-52 w-full bg-[url('/login.png')] bg-cover bg-center md:block md:h-auto md:flex-[1.1]" />

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 md:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-5xl font-poppins">Franchise Store</h2>
            <p className="mt-1 text-sm text-[#e2794c]">Central kitchen and franchise</p>
            <h1 className="mt-1 text-2xl font-poppins">SIGN IN</h1>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="space-y-2 text-sm">
              <label htmlFor="username" className="font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-[#e2794c] focus:ring-2 focus:ring-[#e2794c]/20"
                required
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="password" className="font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 pr-16 text-sm outline-none transition focus:border-[#e2794c] focus:ring-2 focus:ring-[#e2794c]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="sr-only">
                    {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end text-xs">
              <a href="#" className="text-gray-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-full bg-[#e2794c] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* <p className="pt-4 text-center text-xs text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="cursor-pointer font-semibold text-black hover:underline"
              >
                Sign up
              </Link>
            </p> */}
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
