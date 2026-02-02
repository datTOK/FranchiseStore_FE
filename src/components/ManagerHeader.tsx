import { useNavigate } from 'react-router-dom'

export default function ManagerHeader() {
    const navigate = useNavigate()
    return (
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
            <h1 className="text-lg font-semibold">Manager</h1>

            <div className='relative group'>
                <div className='flex items-center justify-center gap-3 cursor-pointer'>
                    <img
                        src="https://i.pravatar.cc/100"
                        alt='Admin Avatar'
                        className='w-10 h-10 rounded-full border-2 border-amber-500 cursor-pointer object-cover'
                    />
                    <span className='block text-sm font-medium text-gray-800'>Nguyen Van A</span>
                </div>

                <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                    <div className='px-4 py-3 border-b border-gray-100'>
                        <span className='block text-sm font-semibold text-gray-800'>Staff</span>
                        <span className='block text-sm text-gray-500 truncate'>staff2026@gmail.com</span>
                    </div>
                    <ul className='py-1'>
                        <li>
                            <button
                                onClick={() => navigate('/staff/dashboard')}
                                className='w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            >
                                Quản lý hệ thống
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/staff/profile')}
                                className='w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            >
                                Hồ sơ cá nhân
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/login')}
                                className='w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            >
                                Đăng xuất
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}

