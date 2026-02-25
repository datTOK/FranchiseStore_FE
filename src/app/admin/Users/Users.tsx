import { useCallback, useEffect, useState } from 'react';
import type { CreateUserPayload, GetUsersParams, Users } from '../../../types/users.type';
import { userApi } from '../../../api/users.api';
import { Eye, EyeOff } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>({
    store_id: 0,
    role: 'FR_STAFF',
    name: '',
    username: '',
    password: '',
    phone: '',
    dob: '',
  });
  const [creating, setCreating] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetUsersParams = {};

      if (filterRole) {
        params.role = filterRole;
      }

      if (filterStatus) {
        params.status = filterStatus === 'active';
      }

      const res = await userApi.getAllUsers(params);
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async () => {
    try {
      setCreating(true);

      await userApi.createUser({
        ...form,
        store_id: Number(form.store_id),
      });

      setIsOpen(false);
      fetchUsers();

      setForm({
        store_id: 1,
        role: 'FR_STAFF',
        name: '',
        username: '',
        password: '',
        phone: '',
        dob: '',
      });
    } catch (err) {
      console.error(err);
      alert('Create user failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            User Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and monitor system users
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
        >
          + Add User
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="FR_STAFF">FR_STAFF</option>
          <option value="CK_STAFF">CK_STAFF</option>
          <option value="MANAGER">MANAGER</option>
          <option value="SC_COORDINATOR">SC_COORDINATOR</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={() => {
            setFilterRole('');
            setFilterStatus('');
          }}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Clear
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Username</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-center">Store</th>
              <th className="px-6 py-4 text-center">Role</th>
              <th className="px-6 py-4 text-left">DOB</th>
              <th className="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      #{user.id}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.username}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.phone}
                </td>

                <td className="px-6 py-4 text-center">
                  {user.store_id ?? (
                    <span className="text-gray-400 italic">
                      None
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN'
                      ? 'bg-red-100 text-red-600'
                      : user.role === 'FR_STAFF'
                        ? 'bg-blue-100 text-blue-600'
                        : user.role === 'MANAGER'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.dob).toLocaleDateString("vi-VN")}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${user.is_active
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              No users found.
            </p>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Create New User</h3>

            <div className="space-y-4">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm({ ...form, dob: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="number"
                placeholder="Store ID"
                min={1}
                value={form.store_id}
                onChange={(e) =>
                  setForm({ ...form, store_id: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="FR_STAFF">FR_STAFF</option>
                <option value="CK_STAFF">CK_STAFF</option>
                <option value="MANAGER">MANAGER</option>
                <option value="SC_COORDINATOR">SC_COORDINATOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
