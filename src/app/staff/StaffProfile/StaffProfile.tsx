import { useMemo, useState } from "react"

type Role = "ADMIN" | "STAFF" | "CUSTOMER"

type Store = {
  id: string
  name: string
  address: string
  phone?: string
}

type UserProfile = {
  id: string
  name: string
  email: string
  role: Role
  store?: Store | null
}

// Demo data (sau này nối API/localStorage)
const mockUser: UserProfile = {
  id: "u01",
  name: "thai",
  email: "thai2026@gmail.com",
  role: "STAFF",
  store: {
    id: "S-01",
    name: "Franchise Store - CN1",
    address: "123 ABC, Quận 1, TP.HCM",
    phone: "0123456789",
  },
}

const ROLE_PERMISSIONS: Record<Role, { label: string; desc?: string }[]> = {
  ADMIN: [
    { label: "Quản lý người dùng", desc: "Thêm/sửa/xoá tài khoản" },
    { label: "Quản lý cửa hàng" },
    { label: "Quản lý sản phẩm" },
    { label: "Quản lý đơn hàng" },
    { label: "Xem báo cáo" },
  ],
  STAFF: [
    { label: "Quản lý sản phẩm" },
    { label: "Quản lý đơn hàng" },
    { label: "Xem thông tin cửa hàng" },
  ],
  CUSTOMER: [
    { label: "Xem sản phẩm" },
    { label: "Đặt hàng" },
    { label: "Xem đơn hàng" },
    { label: "Đổi mật khẩu" },
  ],
}

export default function StaffProfile() {
  const [user] = useState<UserProfile>(mockUser)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [msg, setMsg] = useState<string>("")

  const canViewStore = user.role === "ADMIN" || user.role === "STAFF"
  const permissions = useMemo(() => ROLE_PERMISSIONS[user.role] ?? [], [user.role])

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setMsg("")

    if (!currentPassword || !newPassword || !confirm) {
      setMsg("Vui lòng nhập đầy đủ thông tin.")
      return
    }
    if (newPassword.length < 6) {
      setMsg("Mật khẩu mới tối thiểu 6 ký tự.")
      return
    }
    if (newPassword !== confirm) {
      setMsg("Xác nhận mật khẩu không khớp.")
      return
    }

    // TODO: gọi API đổi mật khẩu thật ở đây
    setMsg("✅ Đổi mật khẩu thành công (demo).")
    setCurrentPassword("")
    setNewPassword("")
    setConfirm("")
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
        <p className="text-sm text-gray-500">Đổi mật khẩu • Cửa hàng • Quyền hạn (read-only)</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT: Thông tin + quyền */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/100"
                className="h-14 w-14 rounded-full border-2 border-amber-500 object-cover"
                alt="avatar"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Role: {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-gray-900">Quyền hạn (read-only)</div>
            <div className="flex flex-wrap gap-2">
              {permissions.map((p, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  title={p.desc ?? ""}
                >
                  {p.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Quyền được hiển thị theo role. Không chỉnh sửa tại trang này.
            </p>
          </div>
        </div>

        {/* RIGHT: Cửa hàng + đổi mật khẩu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-gray-900">Thông tin cửa hàng</div>
                <div className="text-xs text-gray-500">Read-only theo role</div>
              </div>
            </div>

            {!canViewStore ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Bạn không có quyền xem cửa hàng. (Chỉ STAFF/ADMIN)
              </div>
            ) : user.store ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Mã cửa hàng</div>
                  <div className="font-semibold text-gray-900">{user.store.id}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Tên cửa hàng</div>
                  <div className="font-semibold text-gray-900">{user.store.name}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                  <div className="text-xs text-gray-500">Địa chỉ</div>
                  <div className="font-semibold text-gray-900">{user.store.address}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Số điện thoại</div>
                  <div className="font-semibold text-gray-900">{user.store.phone ?? "-"}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Chưa có cửa hàng được gán.
              </div>
            )}
          </div>

          {/* Change password */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
              <div className="text-base font-semibold text-gray-900">Đổi mật khẩu</div>
              <div className="text-xs text-gray-500">Tối thiểu 6 ký tự</div>
            </div>

            {msg ? (
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {msg}
              </div>
            ) : null}

            <form onSubmit={onChangePassword} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
