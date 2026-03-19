import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import axiosClient from '../../../api/axiosClient'
import Login from '../../../components/login/Login'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRedirect = (role: string) => {
    console.log('Handling redirect for role:', role)
    const normalizedRole = role?.toString().toUpperCase().trim()

    if (normalizedRole === 'ADMIN') {
      navigate('/admin/dashboard')
    } else if (normalizedRole === 'FR_STAFF') {
      navigate('/fr-staff/dashboard')
    } else if (normalizedRole === 'CK_STAFF') {
      navigate('/ck-staff/dashboard')
    } else if (normalizedRole === 'MANAGER') {
      navigate('/manager/category')
    } else {
      console.warn('Unknown or missing role, defaulting to staff dashboard:', role)
      navigate('/ck-staff/dashboard')
    }
  }

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

      const token = data.accessToken || data.token || data.data?.token

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

          handleRedirect(role)
        } catch (meError) {
          console.error('Failed to fetch user info:', meError)

          const fallbackRole = data.role || data.user?.role
          handleRedirect(fallbackRole)
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
    <Login
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      handleLogin={handleLogin}
      loading={loading}
      error={error}
    />
  )
}

export default LoginPage