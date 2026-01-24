import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import '../../../components/login/Login.css'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

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

          <form className="space-y-4">
            <div className="space-y-2 text-sm">
              <label htmlFor="email" className="font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-[#e2794c] focus:ring-2 focus:ring-[#e2794c]/20"
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
                  placeholder="Enter your password"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 pr-16 text-sm outline-none transition focus:border-[#e2794c] focus:ring-2 focus:ring-[#e2794c]/20"
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
              className="mt-2 w-full cursor-pointer rounded-full bg-[#e2794c] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Login
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
