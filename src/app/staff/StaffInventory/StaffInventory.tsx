import { useState } from 'react'
import StaffInventoryTable from '../../../components/StaffInventory'
import type { InventoryItem, InventoryLog } from '../../../components/StaffInventory'

// Mock Data based on User Request
const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    category_id: 4,
    name: "Bột mì số 8",
    sku: "RAW-BOT-MI-SO-8",
    image_url: null,
    uom: "KG",
    product_type: "RAW_MATERIAL",
    is_active: 1,
    created_at: "2026-01-29T09:15:35.000Z",
    category_name: "RAW_MATERIAL",
    quantity: 120,
    min_stock: 50,
    max_stock: 200
  },
  {
    id: 2,
    category_id: 4,
    name: "Đường tinh luyện",
    sku: "RAW-DUONG-01",
    image_url: null,
    uom: "KG",
    product_type: "RAW_MATERIAL",
    is_active: 1,
    created_at: "2026-02-01T08:00:00.000Z",
    category_name: "RAW_MATERIAL",
    quantity: 10,
    min_stock: 20,
    max_stock: 100
  },
  {
    id: 3,
    category_id: 5,
    name: "Sốt cà chua",
    sku: "SF-SOT-CA-CHUA",
    image_url: null,
    uom: "LIT",
    product_type: "SEMI_FINISHED",
    is_active: 0,
    created_at: "2026-02-05T14:30:00.000Z",
    category_name: "SAUCE",
    quantity: 0,
    min_stock: 5,
    max_stock: 50
  }
]

const MOCK_LOGS: InventoryLog[] = [
  {
    id: 'L001',
    type: 'Import',
    itemName: 'Bột mì số 8',
    quantity: 50,
    date: '2026-02-08 08:30',
    performer: 'Nguyen Van A',
    referenceDoc: 'PO-2026-001',
  },
  {
    id: 'L002',
    type: 'Export',
    itemName: 'Đường tinh luyện',
    quantity: -5,
    date: '2026-02-09 10:15',
    performer: 'Tran Thi B',
    referenceDoc: 'ORD-Store-01',
  },
]

export default function StaffInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY)
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')

  // Filter Logic
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'All' || item.product_type === filterType

    return matchesSearch && matchesType
  })

  // Calculate Stats
  const totalItems = inventory.length
  const activeItems = inventory.filter(i => i.is_active === 1).length
  const rawMaterialCount = inventory.filter(i => i.product_type === 'RAW_MATERIAL').length

  const handleUpdateMinMax = (id: number, min: number, max: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, min_stock: min, max_stock: max } : item
      )
    )
  }

  return (
    <StaffInventoryTable
      inventory={filteredInventory}
      logs={MOCK_LOGS}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterType={filterType}
      setFilterType={setFilterType}
      totalItems={totalItems}
      activeItems={activeItems}
      rawMaterialCount={rawMaterialCount}
      onUpdateMinMax={handleUpdateMinMax}
    />
  )
}
