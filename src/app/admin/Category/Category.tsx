import { useEffect, useState } from 'react';
import { categoryApi } from '../../../api/category.api';
import type { Category } from '../../../types/category.type';

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await categoryApi.getAll();
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="p-6">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Categories</h1>

      {categories.length === 0 ? (
        <p className="text-gray-500">No categories found</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{category.id}</td>

                  <td className="px-4 py-3 font-medium text-gray-900">
                    {category.name}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {category.description}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.is_active === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {category.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
