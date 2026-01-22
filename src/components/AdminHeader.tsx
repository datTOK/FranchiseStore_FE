
export default function AdminHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Admin</span>
        <div className="h-8 w-8 rounded-full bg-gray-300" />
      </div>
    </header>
  )
}

