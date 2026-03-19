import { useEffect, useState } from "react"
import { materialApi } from "../../../api/material.api"
import type { Material, CreateMaterialPayload } from "../../../types/material.type"
import LoadingLottie from "../../../components/LoadingLottie"
import toast from "react-hot-toast"
import { Plus } from "lucide-react"

export default function ManagerMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalPages = Math.ceil(materials.length / pageSize)
  const paginatedMaterials = materials.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const [form, setForm] = useState<CreateMaterialPayload>({
    name: "",
    unit: "",
    description: "",
  })

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const res = await materialApi.getAll()
      setMaterials(res)
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load materials")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.unit) {
      toast.error("Name and unit are required")
      return
    }

    try {
      setCreating(true)

      if (editingMaterial) {
        await materialApi.updateMaterial(editingMaterial.id, form)
        toast.success("Material updated successfully")
      } else {
        await materialApi.createMaterial(form)
        toast.success("Material created successfully")
      }

      setIsOpen(false)
      setEditingMaterial(null)

      setForm({
        name: "",
        unit: "",
        description: "",
      })

      fetchMaterials()
    } catch (err) {
      console.error(err)
      toast.error(
        editingMaterial
          ? "Update material failed"
          : "Create material failed"
      )
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <LoadingLottie />

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Material Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage store materials
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMaterial(null)
            setForm({
              name: "",
              unit: "",
              description: "",
            })
            setIsOpen(true)
          }}
          className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm cursor-pointer"
        >
          + Create Material
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {materials.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No materials found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">SKU</th>
                <th className="px-6 py-4 text-center">Unit</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Created By</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedMaterials.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {m.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {m.sku}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {m.unit}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {m.description}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {m.created_by_name}
                  </td>

                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingMaterial(m)
                        setForm({
                          name: m.name,
                          unit: m.unit,
                          description: m.description,
                        })
                        setIsOpen(true)
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2 text-sm">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setCurrentPage(1)
              setPageSize(Number(e.target.value)) 
            }}
            className="border px-2 py-1 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg ${currentPage === page
                  ? "bg-black text-white"
                  : "border"
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center gap-1 mb-4">
              <h3 className="text-xl font-semibold">
                {editingMaterial ? "Update Material" : "Create Material"}
              </h3>
              <Plus className="text-black" />
            </div>

            <div className="space-y-4">
              <input
                placeholder="Material Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="PC">PC</option>
              </select>

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setEditingMaterial(null)
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={creating}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
              >
                {creating
                  ? editingMaterial
                    ? "Updating..."
                    : "Creating..."
                  : editingMaterial
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}