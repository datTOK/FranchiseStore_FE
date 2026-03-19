import { useEffect, useState } from 'react'
import { productApi } from '../../../api/product.api'
import type { CreateProductPayload, Product } from '../../../types/product.type'
import toast from 'react-hot-toast'
import LoadingLottie from '../../../components/LoadingLottie'
import type { Category } from '../../../types/category.type'
import { categoryApi } from '../../../api/category.api'

export default function ManagerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [form, setForm] = useState<CreateProductPayload>({
    category_id: 0,
    name: '',
    image_url: '',
    uom: '',
  })

  const [priceModal, setPriceModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [unitPrice, setUnitPrice] = useState("")
  const [settingPrice, setSettingPrice] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await productApi.getAll()
      setProducts(res.data.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load products')
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll()
      setCategories(res.data.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load categories')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category_id || !form.uom) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      if (editingProduct) {
        setUpdating(true)

        await productApi.updateProduct(editingProduct.id, {
          ...form,
          is_active: editingProduct.is_active === 1,
        })

        toast.success('Product updated successfully')
      } else {
        setCreating(true)

        await productApi.createProduct(form)

        toast.success('Product created successfully')
      }

      setIsOpen(false)
      setEditingProduct(null)

      setForm({
        category_id: 0,
        name: '',
        image_url: '',
        uom: '',
      })

      fetchProducts()
    } catch (err) {
      console.error(err)
      toast.error('Operation failed')
    } finally {
      setCreating(false)
      setUpdating(false)
    }
  }

  // const openCreateModal = () => {
  //   setEditingProduct(null)
  //   setForm({
  //     category_id: 0,
  //     name: '',
  //     image_url: '',
  //     uom: '',
  //   })
  //   setIsOpen(true)
  // }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)

    setForm({
      category_id: product.category_id,
      name: product.name,
      image_url: product.image_url || '',
      uom: product.uom,
    })

    setIsOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeletingId(id)
      await productApi.deleteProduct(id)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const openPriceModal = (product: Product) => {
    setSelectedProduct(product)
    setUnitPrice("")
    setPriceModal(true)
  }

  const handleSetPrice = async () => {
    if (!selectedProduct || Number(unitPrice) <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    try {
      setSettingPrice(true)

      await productApi.setUnitPrice(selectedProduct.id, {
        unit_price: Number(unitPrice),
      })

      toast.success("Price updated successfully")

      setPriceModal(false)
      fetchProducts()
    } catch (err) {
      console.error(err)
      toast.error("Failed to set price")
    } finally {
      setSettingPrice(false)
    }
  }

  if (loading) return <LoadingLottie />
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Product Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and monitor all store products
          </p>
        </div>

        {/* <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
        >
          + Create Product
        </button> */}
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No products found.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">SKU</th>
                <th className="px-6 py-4 text-center">Unit Price</th>
                <th className="px-6 py-4 text-center">UOM</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                      <span className="font-semibold text-gray-800">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {product.category_name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {product.sku}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {product.unit_price ? parseFloat(product.unit_price) : 'N/A'}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {product.uom}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {product.is_active === 1 ? 'Active' : 'Inactive'}
                  </td>

                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg disabled:opacity-50"
                    >
                      {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => openPriceModal(product)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg"
                    >
                      Set Price
                    </button>
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
              {editingProduct ? 'Update Product' : 'Create Product'}
            </h3>

            <div className="space-y-4">
              <input
                placeholder="Product Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category_id: Number(e.target.value),
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={0}>Select Category</option>
                {categories
                  .filter((c) => c.is_active === 1)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>

              <input
                placeholder="Image URL"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={form.uom}
                onChange={(e) =>
                  setForm({ ...form, uom: e.target.value })
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
                disabled={creating || updating}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
              >
                {editingProduct
                  ? updating
                    ? 'Updating...'
                    : 'Update'
                  : creating
                    ? 'Creating...'
                    : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {priceModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">

            <h3 className="text-xl font-semibold mb-4">
              Set Product Price
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Product: <strong>{selectedProduct.name}</strong>
            </p>

            <input
              type="number"
              placeholder="Unit Price"
              min={0}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setPriceModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSetPrice}
                disabled={settingPrice}
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {settingPrice ? "Saving..." : "Set Price"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}