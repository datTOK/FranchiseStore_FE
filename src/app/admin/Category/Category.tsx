import { useEffect, useState } from 'react';
import { categoryApi } from '../../../api/category.api';
import type { Category } from '../../../types/category.type';
import toast from 'react-hot-toast';

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

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

  const handleOpenCreate = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setDescription(category.description)
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Name is required')
      return
    }

    try {
      if (editingId) {
        await categoryApi.updateCategory(editingId, {
          name,
          description,
        })
        toast.success("Category updated successfully!")
      } else {
        await categoryApi.createCategory({
          name,
          description,
        })
        toast.success("Category created successfully!")
      }

      setOpen(false)
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast.error("Action failed!")
    }
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmDelete) return

    try {
      await categoryApi.deleteCategory(id)
      toast.success("Category deleted successfully!")
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast.error("Delete failed!")
    }
  }

  if (loading) {
    return <div className="p-6">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Category Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and organize product categories
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
        >
          + Create Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              No categories found.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {category.id}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-600 max-w-sm">
                    {category.description || (
                      <span className="italic text-gray-400">
                        No description
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${category.is_active === 1
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {category.is_active === 1
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg border hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:opacity-80 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editingId ? 'Update Category' : 'Create Category'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">
                Category Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-lg border hover:bg-gray-100 transition text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-lg bg-black text-white hover:opacity-90 transition text-sm"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
