import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import inventoryApi, { type InventoryItemApi } from "../../../api/inventoryApi";
import storePricingApi, { type StorePricingRow } from "../../../api/storePricingApi";
import { categoryApi } from "../../../api/category.api";
import type { Category } from "../../../types/category.type";

type InventoryRow = {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  category_name: string;
  qty: number;
  status: "In stock" | "Low stock" | "Out of stock";
  unit_price: number | null;
  sale_price: number | null;
};

type ErrorWithResponseMessage = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getErrorMessage(e: unknown, fallback: string) {
  const err = e as ErrorWithResponseMessage;
  return err?.response?.data?.message || err?.message || fallback;
}

function toNumber(v: string | number | undefined | null) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function formatPrice(value: number | null) {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("vi-VN");
}

export default function FRStaffInventory() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [editingRow, setEditingRow] = useState<InventoryRow | null>(null);
  const [salePriceInput, setSalePriceInput] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [invRes, catRes, pricingRes] = await Promise.all([
  inventoryApi.getAll(),
  categoryApi.getAll(),
  storePricingApi.getAll(),
]);

const inv: InventoryItemApi[] = Array.isArray(invRes?.data) ? invRes.data : [];
const cats: Category[] = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];
const pricings: StorePricingRow[] = Array.isArray(pricingRes?.data?.data)
  ? pricingRes.data.data
  : [];

      const catMap = new Map<number, string>(
        cats.map((c) => [Number(c.id), String(c.name)])
      );

      const salePriceMap = new Map<number, number>();
const unitPriceMap = new Map<number, number>();

for (const p of pricings) {
  const productId = Number(p.product_id);
  const salePrice = toNumber(p.sale_price);
  const unitPrice = toNumber(p.unit_price);

  if (Number.isFinite(productId)) {
    salePriceMap.set(productId, salePrice);
    unitPriceMap.set(productId, unitPrice);
  }
}

      const LOW_STOCK_THRESHOLD = 10;

      const mapped: InventoryRow[] = inv.map((item) => {
        const qty = toNumber(item.available_quantity ?? item.quantity);

        return {
  id: item.id,
  product_id: item.product_id,
  sku: item.sku,
  name: item.name,
  category_name: catMap.get(Number(item.category_id)) || String(item.category_id ?? "-"),
  qty,
  status:
    qty <= 0
      ? "Out of stock"
      : qty <= LOW_STOCK_THRESHOLD
      ? "Low stock"
      : "In stock",
  unit_price: unitPriceMap.has(Number(item.product_id))
    ? unitPriceMap.get(Number(item.product_id)) ?? null
    : null,
  sale_price: salePriceMap.has(Number(item.product_id))
    ? salePriceMap.get(Number(item.product_id)) ?? null
    : null,
};
      });

      setRows(mapped);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load inventory"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredRows = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return rows.filter((item) => {
      return (
        !s ||
        item.name.toLowerCase().includes(s) ||
        item.sku.toLowerCase().includes(s)
      );
    });
  }, [rows, searchTerm]);

  const totalItems = rows.length;
  const inStockCount = rows.filter((i) => i.status === "In stock").length;
  const lowStockCount = rows.filter((i) => i.status === "Low stock").length;
  const outOfStockCount = rows.filter((i) => i.status === "Out of stock").length;

  const openEditModal = (row: InventoryRow) => {
    setEditingRow(row);
    setSalePriceInput(row.sale_price != null ? String(row.sale_price) : "");
    setOpenEdit(true);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingRow(null);
    setSalePriceInput("");
  };

  const handleSavePrice = async () => {
    if (!editingRow) return;

    const parsed = Number(salePriceInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Sale price must be a valid number");
      return;
    }

    try {
      setSaving(true);

      await storePricingApi.setSalePrice(editingRow.product_id, {
        sale_price: parsed,
      });

      toast.success("Sale price updated successfully");
      closeEditModal();
      await loadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update sale price"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <Card title="Total Items" value={totalItems} sub="All items" />
        <Card title="In stock" value={inStockCount} sub="Qty > 10" />
        <Card title="Low stock" value={lowStockCount} sub="Qty 1 - 10" />
        <Card title="Out of stock" value={outOfStockCount} sub="Qty = 0" />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Inventory List</div>
          <div style={{ flex: 1 }} />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, Name..."
            style={{
              height: 40,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              width: 280,
            }}
          />

          <button
            onClick={() => void loadData()}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? <div style={{ padding: 12 }}>Loading...</div> : null}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f6f7fb" }}>
  <Th>ID</Th>
  <Th>SKU & Name</Th>
  <Th>Category</Th>
  <Th>Qty</Th>
  <Th>Status</Th>
  <Th>Import Price</Th>
  <Th>Sale Price</Th>
  <Th style={{ textAlign: "right" }}>Actions</Th>
</tr>
            </thead>

            <tbody>
              {filteredRows.map((x) => (
                <tr key={x.id} style={{ borderTop: "1px solid #eee" }}>
                  <Td>{x.id}</Td>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{x.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{x.sku}</div>
                  </Td>
                  <Td>{x.category_name}</Td>
                  <Td>{x.qty}</Td>
                  <Td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        border: "1px solid #ddd",
                        background:
                          x.status === "In stock"
                            ? "#e9fff2"
                            : x.status === "Low stock"
                            ? "#fff7e6"
                            : "#fff2f2",
                      }}
                    >
                      {x.status}
                    </span>
                  </Td>
                  <Td>{formatPrice(x.unit_price)}</Td>
<Td>{formatPrice(x.sale_price)}</Td>
<Td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => openEditModal(x)}
                      style={{
                        border: "1px solid #ddd",
                        background: "#fff",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Edit Price
                    </button>
                  </Td>
                </tr>
              ))}

              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 16, opacity: 0.7 }}>
                    No data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {openEdit && editingRow ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Edit Sale Price
            </div>

            <div style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
              {editingRow.name} ({editingRow.sku})
            </div>

            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Sale Price
            </label>

            <input
              type="number"
              min="0"
              value={salePriceInput}
              onChange={(e) => setSalePriceInput(e.target.value)}
              placeholder="Enter sale price"
              style={{
                width: "100%",
                height: 42,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={closeEditModal}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => void handleSavePrice()}
                disabled={saving}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Card(props: { title: string; value: number; sub: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 12, background: "#fff", minWidth: 240 }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{props.title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{props.value}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{props.sub}</div>
    </div>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      style={{ textAlign: "left", padding: 12, fontSize: 13, color: "#111" }}
    />
  );
}

function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} style={{ padding: 12, verticalAlign: "top" }} />;
}