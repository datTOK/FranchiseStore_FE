import { Users } from "lucide-react";
import Card from "../../../components/Card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">Welcome back</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card
          title='Tổng người dùng'
          value={1}
          subtext='Đang hoạt động'
          borderColor='border-yellow-500'
          icon={<Users className='h-6 w-6 text-blue-600' />}
        />
        <Card
          title='Tổng người dùng'
          value={1}
          subtext='Đang hoạt động'
          borderColor='border-yellow-500'
          icon={<Users className='h-6 w-6 text-blue-600' />}
        />
        <Card
          title='Tổng người dùng'
          value={1}
          subtext='Đang hoạt động'
          borderColor='border-yellow-500'
          icon={<Users className='h-6 w-6 text-blue-600' />}
        />
      </div>
    </div>
  )
}
