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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Categories</h1>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Category
        </button>
      </div>

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
                <th className="px-4 py-3 text-center">Actions</th>
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
                      className={`px-2 py-1 text-xs font-medium rounded-full ${category.is_active === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {category.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Update Category' : 'Create Category'}
            </h2>

            {/* Name */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
