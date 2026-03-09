import { useEffect, useMemo, useState } from "react";
import StaffInventoryTable from "../../../components/CKStaffInventory";
import type { InventoryItem } from "../../../components/CKStaffInventory";
import inventoryApi from "../../../api/inventoryApi";
import type { InventoryItemApi } from "../../../api/inventoryApi";
import { categoryApi } from "../../../api/category.api";
import type { Category } from "../../../types/category.type";


  


function toNumber(v: string | number | undefined) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function mapInventoryToRow(i: InventoryItemApi, categoryName: string): InventoryItem {
  const qty = toNumber(i.available_quantity ?? i.quantity);
  const LOW_STOCK_THRESHOLD = 10; // <=10 là Low stock, bạn muốn đổi số thì đổi ở đây
  return {
    id: i.id,
    sku: i.sku,
    name: i.name,
    type: i.product_type, // giữ RAW_MATERIAL | SEMI_FINISHED | FINISHED
    category_name: categoryName || String(i.category_id ?? "-"),
    qty,
    status: qty <= 0 ? "Out of stock" : qty <= LOW_STOCK_THRESHOLD ? "Low stock" : "In stock",
  };
}

type ErrorWithResponseMessage = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getErrorMessage(e: unknown) {
  const err = e as ErrorWithResponseMessage;
  return err?.response?.data?.message || err?.message || "Load inventory failed";
}

export default function StaffInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
 
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError("");
      try {
        const [invRes, catRes] = await Promise.all([inventoryApi.getAll(), categoryApi.getAll()]);

        const inv: InventoryItemApi[] = Array.isArray(invRes?.data) ? invRes.data : [];

        const cats: Category[] = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];

        const catMap = new Map<number, string>(cats.map((c) => [Number(c.id), String(c.name)]));

        setInventory(inv.map((x) => mapInventoryToRow(x, catMap.get(Number(x.category_id)) || "")));
      } catch (e: unknown) {
        setError(getErrorMessage(e));
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
    return !s || item.name.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s);
  });
}, [inventory, searchTerm]);

  const totalItems = inventory.length;
  const inStockCount = inventory.filter((i) => i.status === "In stock").length;
const lowStockCount = inventory.filter((i) => i.status === "Low stock").length;
const outOfStockCount = inventory.filter((i) => i.status === "Out of stock").length;


  return (
    <div>
      {loading ? <div style={{ padding: 12 }}>Loading...</div> : null}
      {error ? <div style={{ padding: 12, color: "red" }}>{error}</div> : null}

      <StaffInventoryTable
  inventory={filteredInventory}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  totalItems={totalItems}
  inStockCount={inStockCount}
  lowStockCount={lowStockCount}
  outOfStockCount={outOfStockCount}
/>
    </div>
  );
}
