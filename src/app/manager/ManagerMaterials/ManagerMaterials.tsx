import { useEffect, useState } from "react"
import { materialApi } from "../../../api/material.api"
import type { Material, CreateMaterialPayload } from "../../../types/material.type"
import LoadingLottie from "../../../components/LoadingLottie"
import toast from "react-hot-toast"

export default function ManagerMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)

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
    if (!form.name.trim() || !form.unit.trim()) {
      toast.error("Name and unit are required")
      return
    }

    try {
      setCreating(true)

      await materialApi.createMaterial(form)

      toast.success("Material created successfully")

      setIsOpen(false)

      setForm({
        name: "",
        unit: "",
        description: "",
      })

      fetchMaterials()
    } catch (err) {
      console.error(err)
      toast.error("Create material failed")
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
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
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
              </tr>
            </thead>

            <tbody>
              {materials.map((m) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">
              Create Material
            </h3>

            <div className="space-y-4">
              <input
                placeholder="Material Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                placeholder="Unit (kg, L, PC...)"
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

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
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={creating}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}