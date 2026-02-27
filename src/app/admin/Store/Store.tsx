import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { storeApi } from "../../../api/store.api"
import type { Store } from "../../../types/store.type"
import LoadingLottie from "../../../components/LoadingLottie"

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

  if (loading) {
    return <LoadingLottie />
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Store Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and organize system stores
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
        >
          + Create Store
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {stores.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              No stores found.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Store</th>
                <th className="px-6 py-4 text-left">Address</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">
                      {store.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {store.id}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {store.address}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${store.type === "FR"
                        ? "bg-blue-100 text-blue-600"
                        : store.type === "SC"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-green-100 text-green-600"
                        }`}
                    >
                      {store.type === "FR"
                        ? "Franchise"
                        : store.type === "SC"
                          ? "Supply"
                          : "Central Kitchen"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(store)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg border hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(store.id)}
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editingId ? "Update Store" : "Create Store"}
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">
                Store Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as Store["type"])
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="FR">Franchise Store</option>
                <option value="SC">Supply Coordinator</option>
                <option value="CK">Central Kitchen</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">
                Store Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter store name"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-1">
                Address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
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
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
