import { useEffect, useState } from "react"
import type { MaterialBatch } from "../../../types/materialBatch.type"
import LoadingLottie from "../../../components/LoadingLottie"
import toast from "react-hot-toast"
import { materialBatchApi } from "../../../api/materialBatches.api"
import type { Material } from "../../../types/material.type"
import { materialApi } from "../../../api/material.api"
import { PackagePlus } from "lucide-react"

export default function ManagerMaterialBatches() {
    const [batches, setBatches] = useState<MaterialBatch[]>([])
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const totalPages = Math.ceil(batches.length / pageSize)

    const paginatedBatches = batches.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const [form, setForm] = useState({
        material_id: 0,
        quantity: "",
        unit: "",
        supplier_name: "",
        received_date: "",
        notes: ""
    })

    const fetchMaterials = async () => {
        try {
            const res = await materialApi.getAll()
            setMaterials(res)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load materials")
        }
    }

    const fetchBatches = async () => {
        try {
            setLoading(true)
            const res = await materialBatchApi.getAll()
            setBatches(res.data.data)
        } catch (err) {
            console.error(err)
            setError("Failed to load material batches")
            toast.error("Failed to load material batches")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateBatch = async () => {
        if (!form.material_id || !form.quantity || !form.unit) {
            toast.error("Please fill required fields")
            return
        }

        try {
            setCreating(true)

            await materialBatchApi.createBatch({
                material_id: form.material_id,
                quantity: Number(form.quantity),
                unit: form.unit,
                supplier_name: form.supplier_name,
                received_date: form.received_date,
                notes: form.notes
            })

            toast.success("Batch created successfully")

            setIsCreateOpen(false)

            setForm({
                material_id: 0,
                quantity: "",
                unit: "",
                supplier_name: "",
                received_date: "",
                notes: ""
            })

            fetchBatches()
        } catch (err) {
            console.error(err)
            toast.error("Create batch failed")
        } finally {
            setCreating(false)
        }
    }

    useEffect(() => {
        fetchBatches()
        fetchMaterials()
    }, [])

    if (loading) return <LoadingLottie />
    if (error) return <div className="p-6 text-red-500">{error}</div>

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        Material Batches
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Manage all received material batches
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                    + Create Batch
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {batches.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        No batches found
                    </div>
                ) : (
                    <>
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 text-left">Batch Code</th>
                                    <th className="px-6 py-4 text-left">Material</th>
                                    <th className="px-6 py-4 text-left">Supplier</th>
                                    <th className="px-6 py-4 text-center">Quantity</th>
                                    <th className="px-6 py-4 text-center">Received Date</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Created By</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedBatches.map((batch) => (
                                    <tr key={batch.id} className="border-t hover:bg-gray-50">
                                        <td className="px-6 py-4 font-semibold">
                                            {batch.batch_code}
                                        </td>

                                        <td className="px-6 py-4">
                                            {batch.material_name}
                                            <div className="text-xs text-gray-400">
                                                {batch.material_sku}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {batch.supplier_name}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            {parseFloat(batch.quantity)} {batch.unit}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            {new Date(batch.received_date).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${batch.status === "RECEIVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {batch.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {batch.created_by_name}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
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

            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-xl font-semibold">
                                Create Material Batch
                            </h3>
                            <PackagePlus className="text-black" />
                        </div>

                        <div className="space-y-4">
                            <select
                                value={form.material_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        material_id: Number(e.target.value),
                                    })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value={0}>Select Material</option>

                                {materials.map((material) => (
                                    <option key={material.id} value={material.id}>
                                        {material.name} ({material.unit})
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                min={1}
                                placeholder="Quantity"
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm({ ...form, quantity: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <input
                                placeholder="Unit (kg, L...)"
                                value={form.unit}
                                onChange={(e) =>
                                    setForm({ ...form, unit: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <input
                                placeholder="Supplier Name"
                                value={form.supplier_name}
                                onChange={(e) =>
                                    setForm({ ...form, supplier_name: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <input
                                type="date"
                                value={form.received_date}
                                onChange={(e) =>
                                    setForm({ ...form, received_date: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <textarea
                                placeholder="Notes"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateBatch}
                                disabled={creating}
                                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Create Batch"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}