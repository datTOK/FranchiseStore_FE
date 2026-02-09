import React from 'react'
import {
  Search,
  Filter,
  Package,
  History,
  AlertCircle,
  Calendar,
  Edit2,
  X,
  Check
} from 'lucide-react'
import Card from './Card'

// Data Types based on User Request
export interface InventoryItem {
  id: number
  category_id: number
  name: string
  sku: string
  image_url: string | null
  uom: string
  product_type: string
  is_active: number
  created_at: string
  category_name: string
  quantity: number
  min_stock: number
  max_stock: number
}

// Keep History Log for the second tab (optional, preserving existing feature)
export interface InventoryLog {
  id: string
  type: 'Import' | 'Export' | 'Adjustment' | 'Transfer'
  itemName: string
  quantity: number
  date: string
  performer: string
  referenceDoc: string
}

interface StaffInventoryProps {
  inventory: InventoryItem[]
  logs: InventoryLog[]
  activeTab: 'inventory' | 'history'
  setActiveTab: (tab: 'inventory' | 'history') => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterType: string
  setFilterType: (type: string) => void
  // Stats
  totalItems: number
  activeItems: number
  rawMaterialCount: number
  // Actions
  onUpdateMinMax: (id: number, min: number, max: number) => void
}

const StaffInventory: React.FC<StaffInventoryProps> = ({
  inventory,
  logs,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  totalItems,
  activeItems,
  rawMaterialCount,
  onUpdateMinMax
}) => {
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editMin, setEditMin] = React.useState<number>(0)
  const [editMax, setEditMax] = React.useState<number>(0)

  const handleEditClick = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditMin(item.min_stock)
    setEditMax(item.max_stock)
  }

  const handleSaveClick = (id: number) => {
    onUpdateMinMax(id, editMin, editMax)
    setEditingId(null)
  }

  const getStockStatus = (quantity: number, min: number, max: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    if (quantity <= min) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
    if (quantity > max) return { label: 'Overstock', color: 'bg-blue-100 text-blue-800', icon: Package }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: Check }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-600">
            Manage inventory list and stock history
          </p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      {/* Quick Stats Widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          title="Total Items"
          value={totalItems}
          subtext="Total items in stock"
          borderColor="border-blue-500"
          icon={<Package className="h-6 w-6 text-blue-600" />}
        />
        <Card
          title="Active Items"
          value={activeItems}
          subtext="Items with Active status"
          borderColor="border-green-500"
          icon={<AlertCircle className="h-6 w-6 text-green-600" />}
        />
        <Card
          title="Raw Material"
          value={rawMaterialCount}
          subtext="Number of raw materials"
          borderColor="border-yellow-500"
          icon={<Calendar className="h-6 w-6 text-yellow-600" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Tabs & Filters */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            {/* Tabs */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition ${
                  activeTab === 'inventory'
                    ? 'border-[#e2794c] text-[#e2794c]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="h-4 w-4" />
                Inventory List
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition ${
                  activeTab === 'history'
                    ? 'border-[#e2794c] text-[#e2794c]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="h-4 w-4" />
                Stock History
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search SKU, Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#e2794c] focus:ring-1 focus:ring-[#e2794c]"
                />
              </div>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm outline-none focus:border-[#e2794c] focus:ring-1 focus:ring-[#e2794c]"
                >
                  <option value="All">All Types</option>
                  <option value="RAW_MATERIAL">Raw Material</option>
                  <option value="SEMI_FINISHED">Semi Finished</option>
                </select>
                <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {activeTab === 'inventory' ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">SKU & Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Min/Max</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => {
                  const status = getStockStatus(item.quantity, item.min_stock, item.max_stock)
                  const StatusIcon = status.icon
                  const isEditing = editingId === item.id

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {item.product_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {item.quantity} <span className="text-xs text-gray-500">{item.uom}</span>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex flex-col gap-1 w-24">
                            <input
                              type="number"
                              value={editMin}
                              onChange={(e) => setEditMin(Number(e.target.value))}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              placeholder="Min"
                            />
                            <input
                              type="number"
                              value={editMax}
                              onChange={(e) => setEditMax(Number(e.target.value))}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              placeholder="Max"
                            />
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div><span className="text-xs text-gray-500">Min:</span> {item.min_stock}</div>
                            <div><span className="text-xs text-gray-500">Max:</span> {item.max_stock}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSaveClick(item.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-gray-400 hover:text-[#e2794c] transition"
                            title="Adjust Min/Max Stock"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3">Performer</th>
                  <th className="px-6 py-3">Reference Doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{log.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          log.type === 'Import'
                            ? 'bg-green-100 text-green-800'
                            : log.type === 'Export'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{log.itemName}</td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${
                        log.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    </td>
                    <td className="px-6 py-4">{log.performer}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.referenceDoc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination (Static) */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{inventory.length}</span> of <span className="font-medium">{inventory.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffInventory
