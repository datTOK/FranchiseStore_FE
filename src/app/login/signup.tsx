type SignupProps = {
  onLoginClick: () => void
}

function Signup({ onLoginClick }: SignupProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff7f2] text-slate-900 md:flex-row">
      <div className="hidden h-52 w-full bg-[url('/login.png')] bg-cover bg-center md:block md:h-auto md:flex-[1.1]" />

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 md:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Franchise Store</h2>
            <h1 className="mt-1 text-xl font-semibold">Đăng ký tài khoản</h1>
            <p className="mt-1 text-sm text-[#e2794c]">Central kitchen and franchise</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2 text-sm">
              <label htmlFor="fullName" className="font-medium">
                Họ và tên
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                className="w-full rounded-full border border-[#e2794c] px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#e2794c]/30"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="username" className="font-medium">
                Tên người dùng
              </label>
              <input
                id="username"
                type="text"
                placeholder="Nhập tên người dùng"
                className="w-full rounded-full border border-[#e2794c] px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#e2794c]/30"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="password" className="font-medium">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full rounded-full border border-[#e2794c] px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#e2794c]/30"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="confirmPassword" className="font-medium">
                Nhập lại mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-full border border-[#e2794c] px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#e2794c]/30"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="phone" className="font-medium">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                className="w-full rounded-full border border-[#e2794c] px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#e2794c]/30"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="birthday" className="font-medium">
                Ngày sinh
              </label>
              <input
                id="birthday"
                type="date"
                className="w-full rounded-full border border-[#e2794c] px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#e2794c]/30"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-[#e2794c] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Đăng ký
            </button>

            <p className="pt-4 text-center text-xs text-gray-600">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="font-semibold text-black hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup

