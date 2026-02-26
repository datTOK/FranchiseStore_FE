import { useEffect, useMemo, useState } from "react";
import StaffInventoryTable from "../../../components/CKStaffInventory";
import type { InventoryItem, InventoryLog } from "../../../components/CKStaffInventory";
import inventoryApi from "../../../api/inventoryApi";
import type { InventoryItemApi, ProductType } from "../../../api/inventoryApi";
import { categoryApi } from "../../../api/category.api";

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

function toNumber(v: any) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function mapInventoryToRow(i: InventoryItemApi, categoryName: string): InventoryItem {
  const qty = toNumber(i.available_quantity ?? i.quantity);
  return {
    id: i.id,
    sku: i.sku,
    name: i.name,
    type: i.product_type, // giữ RAW_MATERIAL | SEMI_FINISHED | FINISHED
    category_name: categoryName || String(i.category_id ?? "-"),
    qty,
    status: qty > 0 ? "Active" : "Inactive",
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
    const fetchInventory = async () => {
      setLoading(true);
      setError("");
      try {
        const [invRes, catRes] = await Promise.all([inventoryApi.getAll(), categoryApi.getAll()]);

        const inv: InventoryItemApi[] = Array.isArray(invRes?.data) ? invRes.data : [];

        const cats = Array.isArray(catRes?.data?.data)
          ? catRes.data.data
          : Array.isArray(catRes?.data)
          ? catRes.data
          : [];

        const catMap = new Map<number, string>(cats.map((c: any) => [Number(c.id), String(c.name)]));

        setInventory(inv.map((x) => mapInventoryToRow(x, catMap.get(Number(x.category_id)) || "")));
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Load inventory failed");
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesSearch = !s || item.name.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s);
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