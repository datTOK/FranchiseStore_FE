import { useEffect, useState } from 'react';
import type { Users } from '../../../types/users.type';
import { userApi } from '../../../api/users.api';

export default function UsersPage() {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await userApi.getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-gray-600">
          Welcome to User management
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-center">Store</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="px-4 py-3">DOB</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">
                  #{user.id}
                </td>

                <td className="px-4 py-3 text-gray-900">
                  {user.name}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {user.username}
                </td>

                <td className="px-4 py-3">{user.phone}</td>

                <td className="px-4 py-3 text-center">
                  {user.store_id ?? (
                    <span className="text-gray-400 italic">
                      None
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-red-100 text-red-700'
                        : user.role === 'FR_STAFF'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {new Date(user.dob).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="p-6 text-gray-500 text-center">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}
