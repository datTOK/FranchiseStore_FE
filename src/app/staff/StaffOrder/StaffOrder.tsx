import { Users } from "lucide-react";
import Card from "../../../components/Card";

export default function StaffInventory() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Store Orders</h2>
      <p className="text-gray-600">
        Manage your store's current orders and status
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
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
