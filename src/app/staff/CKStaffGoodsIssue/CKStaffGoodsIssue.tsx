import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import goodsIssueApi from "../../../api/goodsIssueApi";
import orderApi from "../../../api/orderApi";
import productApi from "../../../api/productApi";
import { storeApi } from "../../../api/store.api";

type ItemRow = {
  product_id: number;
  quantity: number;
};

function toNum(v: any, fallback = 0) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : fallback;
}

function normStatus(s: any) {
  return String(s ?? "").toUpperCase().trim();
}

export default function CKStaffGoodsIssue() {
  // create form
  const [orderId, setOrderId] = useState<string>("");
  const [storeTo, setStoreTo] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([{ product_id: 0, quantity: 1 }]);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // list
  const [loadingList, setLoadingList] = useState(false);
  const [goodsIssues, setGoodsIssues] = useState<any[]>([]);

  // dropdown data
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const storeMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of stores) {
      const id = toNum(s?.id, 0);
      if (id > 0) m.set(id, String(s?.name ?? s?.store_name ?? `Store ${id}`));
    }
    return m;
  }, [stores]);

  const refreshList = async () => {
    try {
      setLoadingList(true);
      const res: any = await goodsIssueApi.getAll();
      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      setGoodsIssues(list);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Load goods issues thất bại");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // orders
        const oRes: any = await orderApi.getAll();
        const oList = Array.isArray(oRes?.data) ? oRes.data : Array.isArray(oRes?.data?.data) ? oRes.data.data : [];
        setOrders(oList);

        // products
        const pRes: any = await productApi.getAll();
        const pList = Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes?.data?.data) ? pRes.data.data : [];
        setProducts(pList);

        // stores
        const sRes: any = await storeApi.getAll();
        const sList = Array.isArray(sRes?.data?.data) ? sRes.data.data : Array.isArray(sRes?.data) ? sRes.data : [];
        setStores(sList);

        // list goods issues
        await refreshList();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Load data thất bại");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateItem = (idx: number, key: keyof ItemRow, value: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { product_id: 0, quantity: 1 }]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onCreate = async () => {
    const oid = toNum(orderId, 0);
    const st = toNum(storeTo, 0);

    if (oid <= 0) {
      toast.error("Vui lòng chọn Order");
      return;
    }
    if (st <= 0) {
      toast.error("Vui lòng chọn Store nhận hàng (store_to)");
      return;
    }

    const cleaned = items
      .map((it) => ({ product_id: toNum(it.product_id, 0), quantity: toNum(it.quantity, 0) }))
      .filter((it) => it.product_id > 0 && it.quantity > 0);

    if (cleaned.length === 0) {
      toast.error("Vui lòng chọn sản phẩm và quantity > 0");
      return;
    }

    try {
      setLoadingCreate(true);
      await goodsIssueApi.create({ order_id: oid, store_to: st, items: cleaned });
      toast.success("Tạo Goods Issue thành công");
      setOrderId("");
      setStoreTo("");
      setItems([{ product_id: 0, quantity: 1 }]);
      await refreshList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Create goods issue thất bại");
    } finally {
      setLoadingCreate(false);
    }
  };

  const onComplete = async (id: number) => {
    try {
      await goodsIssueApi.complete(id);
      toast.success("Complete thành công");
      await refreshList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Complete thất bại");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Goods Issue</div>
            <button
              onClick={refreshList}
              disabled={loadingList}
              style={{
                height: 40,
                padding: "0 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: loadingList ? "not-allowed" : "pointer",
              }}
            >
              {loadingList ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* CREATE */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 16,
              border: "1px solid #eee",
              marginTop: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Create Goods Issue</div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                style={{
                  height: 42,
                  width: 360,
                  maxWidth: "100%",
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                }}
              >
                <option value="">(Select order)</option>
                {orders.map((o: any) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.id} - {o.order_code}
                  </option>
                ))}
              </select>

              <select
                value={storeTo}
                onChange={(e) => setStoreTo(e.target.value)}
                style={{
                  height: 42,
                  width: 360,
                  maxWidth: "100%",
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                }}
              >
                <option value="">(Select store_to)</option>
                {stores.map((s: any) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.id} - {s.name ?? s.store_name}
                  </option>
                ))}
              </select>
            </div>

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
                    width: 520,
                    maxWidth: "100%",
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                  }}
                >
                  <option value="0">(Select product)</option>
                  {products.map((p: any) => (
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
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: items.length === 1 ? "#f5f5f5" : "#fff",
                    cursor: items.length === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              <button
                onClick={addItem}
                style={{
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
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
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                  cursor: loadingCreate ? "not-allowed" : "pointer",
                }}
              >
                {loadingCreate ? "Creating..." : "Create Goods Issue"}
              </button>
            </div>
          </div>

          {/* LIST */}
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Goods Issues List</div>

          <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 14, background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>ID</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Issue Code</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Order</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Store From</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Store To</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Status</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Created At</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {goodsIssues.map((gi: any) => {
                  const st = normStatus(gi?.status);
                  const canComplete = st !== "COMPLETED";
                  return (
                    <tr key={gi.id}>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{gi.id}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{gi.issue_code}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{gi.order_id}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                        {gi.store_from} - {storeMap.get(toNum(gi.store_from, 0)) ?? ""}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                        {gi.store_to} - {storeMap.get(toNum(gi.store_to, 0)) ?? ""}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{st}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                        {gi.created_at ? new Date(gi.created_at).toLocaleString() : ""}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                        <button
                          onClick={() => onComplete(gi.id)}
                          disabled={!canComplete}
                          style={{
                            height: 36,
                            padding: "0 12px",
                            borderRadius: 12,
                            border: "1px solid #ddd",
                            background: canComplete ? "#fff" : "#f5f5f5",
                            cursor: canComplete ? "pointer" : "not-allowed",
                          }}
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {goodsIssues.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 14, textAlign: "center", color: "#777" }}>
                      Không có goods issue nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}