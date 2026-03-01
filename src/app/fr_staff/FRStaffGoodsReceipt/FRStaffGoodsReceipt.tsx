import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import goodsReceiptApi from "../../../api/goodsReceiptApi";
import  productApi  from "../../../api/productApi";

function normStatus(s: any) {
  return String(s ?? "").toUpperCase().trim();
}

function toNum(v: any, fallback = 0) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : fallback;
}

export default function FRStaffGoodsReceipt() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const productMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of products) m.set(toNum(p?.id, 0), String(p?.name ?? `#${p?.id}`));
    return m;
  }, [products]);

  const refresh = async () => {
    try {
      setLoading(true);
      const res: any = await goodsReceiptApi.getAll();
      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      setRows(list);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Load goods receipts thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // load products for showing name in detail items
        const pRes: any = await productApi.getAll();
        const pList = Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes?.data?.data) ? pRes.data.data : [];
        setProducts(pList);

        await refresh();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Init thất bại");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onView = async (id: number) => {
    try {
      setLoadingDetail(true);
      const res: any = await goodsReceiptApi.getById(id);
      const d = res?.data?.data ?? res?.data ?? null;
      setDetail(d);
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Load detail thất bại");
    } finally {
      setLoadingDetail(false);
    }
  };

  const onConfirm = async (id: number) => {
    try {
      await goodsReceiptApi.confirm(id);
      toast.success("Goods receipt confirmed");
      setOpen(false);
      setDetail(null);
      await refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Confirm thất bại");
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
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Goods Receipt</div>
              <div style={{ color: "#666", marginTop: 4 }}>Receive goods from Central Kitchen (FR side)</div>
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              style={{
                height: 40,
                padding: "0 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div style={{ marginTop: 14, overflowX: "auto", border: "1px solid #eee", borderRadius: 14, background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>ID</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Receipt Code</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Goods Issue</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Order</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Store</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Status</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Created At</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r: any) => {
                  const st = normStatus(r?.status);
                  return (
                    <tr key={r.id}>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{r.id}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{r.receipt_code}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{r.goods_issue_id}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{r.order_id}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{r.store_id}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{st}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                        <button
                          onClick={() => onView(r.id)}
                          disabled={loadingDetail}
                          style={{
                            height: 36,
                            padding: "0 12px",
                            borderRadius: 12,
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: loadingDetail ? "not-allowed" : "pointer",
                            marginRight: 8,
                          }}
                        >
                          View
                        </button>

                        <button
                          onClick={() => onConfirm(r.id)}
                          disabled={st !== "CREATED"}
                          style={{
                            height: 36,
                            padding: "0 12px",
                            borderRadius: 12,
                            border: "1px solid #111",
                            background: st === "CREATED" ? "#111" : "#f5f5f5",
                            color: st === "CREATED" ? "#fff" : "#777",
                            cursor: st === "CREATED" ? "pointer" : "not-allowed",
                          }}
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 14, textAlign: "center", color: "#777" }}>
                      Không có goods receipt nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DETAIL */}
        {open && (
          <div
            onClick={() => {
              setOpen(false);
              setDetail(null);
            }}
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
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 760,
                maxWidth: "100%",
                background: "#fff",
                borderRadius: 16,
                padding: 16,
                border: "1px solid #eee",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Goods Receipt Detail</div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setDetail(null);
                  }}
                  style={{ border: "1px solid #ddd", background: "#fff", borderRadius: 12, height: 36, padding: "0 12px" }}
                >
                  Close
                </button>
              </div>

              {!detail ? (
                <div style={{ padding: 12, color: "#777" }}>No detail</div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div><b>ID:</b> {detail.id}</div>
                    <div><b>Receipt Code:</b> {detail.receipt_code}</div>
                    <div><b>Order:</b> {detail.order_id}</div>
                    <div><b>Goods Issue:</b> {detail.goods_issue_id}</div>
                    <div><b>Store:</b> {detail.store_id}</div>
                    <div><b>Status:</b> {normStatus(detail.status)}</div>
                  </div>

                  <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 8 }}>Items</div>
                  <div style={{ border: "1px solid #eee", borderRadius: 14, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                      <thead>
                        <tr style={{ background: "#fafafa" }}>
                          <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Product</th>
                          <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.items ?? []).map((it: any, idx: number) => (
                          <tr key={idx}>
                            <td style={{ padding: 10, borderBottom: "1px solid #f1f1f1" }}>
                              {it.product_id} - {productMap.get(toNum(it.product_id, 0)) ?? ""}
                            </td>
                            <td style={{ padding: 10, borderBottom: "1px solid #f1f1f1" }}>{String(it.quantity)}</td>
                          </tr>
                        ))}
                        {(detail.items ?? []).length === 0 && (
                          <tr>
                            <td colSpan={2} style={{ padding: 12, textAlign: "center", color: "#777" }}>
                              Không có items.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                    <button
                      onClick={() => onConfirm(detail.id)}
                      disabled={normStatus(detail.status) !== "CREATED"}
                      style={{
                        height: 40,
                        padding: "0 14px",
                        borderRadius: 12,
                        border: "1px solid #111",
                        background: normStatus(detail.status) === "CREATED" ? "#111" : "#f5f5f5",
                        color: normStatus(detail.status) === "CREATED" ? "#fff" : "#777",
                        cursor: normStatus(detail.status) === "CREATED" ? "pointer" : "not-allowed",
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}