import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { storeApi } from "../../../api/store.api"
import type { Store } from "../../../types/store.type"

export default function StorePage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [type, setType] = useState<Store["type"]>("FR")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")

  const fetchStores = async () => {
    try {
      setLoading(true)
      const res = await storeApi.getAll()
      setStores(res.data.data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load stores")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setType("FR")
    setName("")
    setAddress("")
    setOpen(true)
  }

  const handleOpenEdit = (store: Store) => {
    setEditingId(store.id)
    setType(store.type)
    setName(store.name)
    setAddress(store.address)
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Store name is required")
      return
    }

    try {
      if (editingId !== null) {
        await storeApi.updateStore(editingId, {
          type,
          name,
          address,
        })
        toast.success("Store updated successfully!")
      } else {
        await storeApi.createStore({
          type,
          name,
          address,
        })
        toast.success("Store created successfully!")
      }

      setOpen(false)
      fetchStores()
    } catch (err) {
      console.error(err)
      toast.error("Action failed!")
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return

    try {
      await storeApi.deleteStore(id)
      toast.success("Store deleted successfully!")
      fetchStores()
    } catch (err) {
      console.error(err)
      toast.error("Delete failed!")
    }
  }

  if (loading) return <p className="p-6">Loading stores...</p>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Stores</h1>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Store
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{store.id}</td>
                <td className="px-4 py-3 font-semibold">{store.type}</td>
                <td className="px-4 py-3">{store.name}</td>
                <td className="px-4 py-3">{store.address}</td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(store)}
                    className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(store.id)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Update Store" : "Create Store"}
            </h2>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as Store["type"])}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="FR">Franchise Store</option>
              <option value="SC">Supply Coordinator</option>
              <option value="CK">Central Kitchen</option>
            </select>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Store name"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
