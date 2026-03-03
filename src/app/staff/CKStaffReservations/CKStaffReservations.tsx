import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import reservationApi from "../../../api/reservationApi";
import orderApi from "../../../api/orderApi";
import productApi, { type ProductItem } from "../../../api/productApi";
import type { OrderRow } from "../../../api/orderApi";
import type { CreateReservationPayload, ReservationItemInput } from "../../../api/reservationApi";

type ReservationItemRow = {
  product_id: number;
  quantity: number;
};

type LastCreatedInfo = {
  reservation_id: number;
  createdAt: string;
  order_id?: number;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
  }>;
};

function toNum(v: unknown, fallback = 0) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function getProductName(p: ProductItem, fallbackId: number) {
  const alias = p as unknown as { product_name?: string };
  return String(p.name ?? alias.product_name ?? `Product ${fallbackId}`);
}

export default function CKStaffReservations() {
  // create form
  const [orderId, setOrderId] = useState<string>("");
  const [items, setItems] = useState<ReservationItemRow[]>([
    { product_id: 0, quantity: 1 },
  ]);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // complete
  const [loadingComplete, setLoadingComplete] = useState(false);

  // dropdown data
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);

  // show result after create
  const [lastCreated, setLastCreated] = useState<LastCreatedInfo | null>(null);

  const productMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of products) {
      const id = toNum(p?.id, 0);
      if (id > 0) m.set(id, getProductName(p, id));
    }
    return m;
  }, [products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // orders
        const oRes = await orderApi.getAll();
        const oList = Array.isArray((oRes as { data?: OrderRow[] })?.data) ? ((oRes as { data?: OrderRow[] }).data as OrderRow[]) : [];
        setOrders(oList);

        // products
        const pRes = await productApi.getAll();
        const pList = Array.isArray((pRes as { data?: ProductItem[] })?.data) ? ((pRes as { data?: ProductItem[] }).data as ProductItem[]) : [];
        setProducts(pList);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        toast.error(err?.response?.data?.message || err?.message || "Load orders/products thất bại");
      }
    };

    fetchData();
  }, []);

  const updateItem = (idx: number, key: keyof ReservationItemRow, value: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { product_id: 0, quantity: 1 }]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onCreate = async () => {
    const cleaned = items
      .map((it) => ({ product_id: toNum(it.product_id, 0), quantity: toNum(it.quantity, 0) }))
      .filter((it) => it.product_id > 0 && it.quantity > 0);

    if (cleaned.length === 0) {
      toast.error("Vui lòng chọn sản phẩm và quantity > 0");
      return;
    }

    const payload: CreateReservationPayload = { items: cleaned as ReservationItemInput[] };
    const oid = toNum(orderId, 0);
    if (orderId.trim() !== "" && oid > 0) payload.order_id = oid;

    try {
      setLoadingCreate(true);

      const res = await reservationApi.create(payload);

      // lấy reservation id từ backend
      const extractId = (r: unknown): number | undefined => {
        const outer = (r as { data?: unknown })?.data as unknown;
        const primary = (outer as { id?: number; reservation_id?: number })?.id ??
          (outer as { id?: number; reservation_id?: number })?.reservation_id;
        if (typeof primary === "number") return primary;
        const inner = (outer as { data?: unknown })?.data as unknown;
        const secondary = (inner as { id?: number; reservation_id?: number })?.id ??
          (inner as { id?: number; reservation_id?: number })?.reservation_id;
        return typeof secondary === "number" ? secondary : undefined;
      };
      const reservationId = extractId(res);

      if (!reservationId) {
        toast.error("Backend không trả reservation id (không thể auto-complete).");
        return;
      }

      toast.success("Sản xuất thành công");

      setLastCreated({
        reservation_id: Number(reservationId),
        createdAt: new Date().toLocaleString(),
        order_id: payload.order_id,
        items: cleaned.map((it) => ({
          product_id: it.product_id,
          product_name: productMap.get(it.product_id) || `Product ${it.product_id}`,
          quantity: it.quantity,
        })),
      });

      // reset form
      setOrderId("");
      setItems([{ product_id: 0, quantity: 1 }]);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || "Create reservation thất bại");
    } finally {
      setLoadingCreate(false);
    }
  };

  const onComplete = async () => {
    if (!lastCreated) return;

    try {
      setLoadingComplete(true);
      await reservationApi.complete(lastCreated.reservation_id);
      toast.success("Complete thành công");
      setLastCreated(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || "Complete thất bại");
    } finally {
      setLoadingComplete(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* container để không dính background */}
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            borderRadius: 16,
            padding: 20,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Reservations</div>

          {/* CREATE */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 16,
              border: "1px solid #eee",
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Create Reservation</div>

            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              
            </div>

            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                height: 42,
                width: "100%",
                maxWidth: 520,
                padding: "0 12px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#fff",
                marginBottom: 14,
              }}
            >
              <option value="">(Select order)</option>
              {orders.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.id} - {o.order_code}
                </option>
              ))}
            </select>

            <div style={{ fontWeight: 700, marginBottom: 8 }}>Items</div>

            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <select
                  value={String(it.product_id)}
                  onChange={(e) => updateItem(idx, "product_id", toNum(e.target.value, 0))}
                  style={{
                    height: 42,
                    width: 420,
                    maxWidth: "100%",
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                  }}
                >
                  <option value="0">(Select product)</option>
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, "quantity", toNum(e.target.value, 1))}
                  style={{
                    height: 42,
                    width: 140,
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                  }}
                />

                <button
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  style={{
                    height: 42,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "1px solid #eee",
                    background: items.length === 1 ? "#f3f4f6" : "#fff",
                    cursor: items.length === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                onClick={addItem}
                style={{
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid #eee",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                + Add item
              </button>

              <button
                onClick={onCreate}
                disabled={loadingCreate}
                style={{
                  height: 42,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  opacity: loadingCreate ? 0.7 : 1,
                }}
              >
                {loadingCreate ? "Creating..." : "Create"}
              </button>
            </div>

            {/* RESULT + COMPLETE button */}
            {lastCreated ? (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Kết quả sản xuất</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
                  Tạo lúc: {lastCreated.createdAt}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <b>Order ID:</b>{" "}
                  {typeof lastCreated.order_id === "number"
                    ? lastCreated.order_id
                    : "(Sản xuất tồn - không gắn order)"}
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                      background: "#fff",
                      borderRadius: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        <th style={{ textAlign: "left", padding: 10, fontSize: 13 }}>
                          Product (ID - Name)
                        </th>
                        <th style={{ textAlign: "left", padding: 10, fontSize: 13, width: 140 }}>
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastCreated.items.map((r) => (
                        <tr key={r.product_id} style={{ borderTop: "1px solid #eee" }}>
                          <td style={{ padding: 10, fontSize: 14 }}>
                            {r.product_id} - {r.product_name}
                          </td>
                          <td style={{ padding: 10, fontSize: 14 }}>{r.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={onComplete}
                  disabled={loadingComplete}
                  style={{
                    marginTop: 12,
                    height: 42,
                    padding: "0 16px",
                    borderRadius: 12,
                    border: "1px solid #0ea5e9",
                    background: "#0ea5e9",
                    color: "#fff",
                    cursor: "pointer",
                    opacity: loadingComplete ? 0.7 : 1,
                  }}
                >
                  {loadingComplete ? "Completing..." : "Complete"}
                </button>
              </div>
            ) : null}
          </div>

          {/* Note */}
          <div style={{ fontSize: 13, opacity: 0.7 }}>
          </div>
        </div>
      </div>
    </div>
  );
}
