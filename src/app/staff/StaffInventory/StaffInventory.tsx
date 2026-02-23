import { useEffect, useMemo, useState } from "react";
import StaffInventoryTable from "../../../components/StaffInventory";
import type { InventoryItem, InventoryLog } from "../../../components/StaffInventory";
import inventoryApi from "../../../api/inventoryApi";
import type { ProductItem, ProductType } from "../../../api/inventoryApi";

const MOCK_LOGS: InventoryLog[] = [
  {
    id: "L001",
    type: "Import",
    itemName: "Bột mì số 8",
    quantity: 50,
    date: "2026-02-08 08:30",
    performer: "Nguyen Van A",
    referenceDoc: "PO-2026-001",
  },
  {
    id: "L002",
    type: "Export",
    itemName: "Đường tinh luyện",
    quantity: -5,
    date: "2026-02-09 10:15",
    performer: "Tran Thi B",
    referenceDoc: "ORD-Store-01",
  },
];

function mapProductToInventory(p: ProductItem): InventoryItem {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    type: p.product_type,
    category_name: p.category_name,
    qty: 0,
    status: p.is_active === 1 ? "Active" : "Inactive",
  };
}

export default function StaffInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"inventory" | "history">("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ProductType | "All">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await inventoryApi.getAll();
        const products = res.data?.data || [];
        setInventory(products.map(mapProductToInventory));
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Load products failed");
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredInventory = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesSearch =
        !s || item.name.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s);

      const matchesType = filterType === "All" || item.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [inventory, searchTerm, filterType]);

  const totalItems = inventory.length;
  const activeItems = inventory.filter((i) => i.status === "Active").length;
  const rawMaterialCount = inventory.filter((i) => i.type === "RAW_MATERIAL").length;

  return (
    <div>
      {loading ? <div style={{ padding: 12 }}>Loading...</div> : null}
      {error ? <div style={{ padding: 12, color: "red" }}>{error}</div> : null}

      <StaffInventoryTable
        inventory={filteredInventory}
        logs={MOCK_LOGS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType as any}
        totalItems={totalItems}
        activeItems={activeItems}
        rawMaterialCount={rawMaterialCount}
      />
    </div>
  );
}