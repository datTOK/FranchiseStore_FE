import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import goodsIssueApi, { type GoodsIssueRow, type GoodsIssueStatus } from "../../../api/goodsIssueApi";
import orderApi, {
  type OrderRow,
  type OrderDetail,
  type GetOrdersResponse,
} from "../../../api/orderApi";
import productApi, { type ProductItem, type ProductListResponse } from "../../../api/productApi";
import { storeApi } from "../../../api/store.api";
import type { Store } from "../../../types/store.type";

type ItemRow = {
  product_id: number;
  quantity: number;
};

function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function normStatus(s: unknown) {
  return String(s ?? "").toUpperCase().trim();
}

type ErrorShape = {
  message?: string;
  response?: { data?: { message?: string } };
};

function getErrorMessage(e: unknown, fallback: string) {
  const err = e as ErrorShape;
  return err?.response?.data?.message || err?.message || fallback;
}
function formatDateOnly(value?: string): string {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-GB");
}
function getStoreName(s: Store): string {
  const alias = s as unknown as { store_name?: string };
  return s.name ?? alias.store_name ?? `Store ${s.id}`;
}

export default function CKStaffGoodsIssue() {
  
  
  // create form
 const [orderId, setOrderId] = useState<string>("");
const [storeTo, setStoreTo] = useState<string>("");
const [items, setItems] = useState<ItemRow[]>([]);
const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

const [openCreateModal, setOpenCreateModal] = useState(false);
const [submittingModal, setSubmittingModal] = useState(false);

const [contentLeft, setContentLeft] = useState(0);
const [contentWidth, setContentWidth] = useState(window.innerWidth);


  // list
  const [loadingList, setLoadingList] = useState(false);
  const [goodsIssues, setGoodsIssues] = useState<GoodsIssueRow[]>([]);

  // dropdown data
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const storeMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of stores) {
      const id = toNum(s?.id, 0);
      if (id > 0) m.set(id, String(getStoreName(s)));
    }
    return m;
  }, [stores]);
  const productMap = useMemo(() => {
  const m = new Map<number, string>();
  for (const p of products) {
    const id = toNum(p?.id, 0);
    if (id > 0) {
      m.set(id, String(p?.name ?? `Product ${id}`));
    }
  }
  return m;
}, [products]);

  const refreshList = async () => {
    try {
      setLoadingList(true);
      const res = await goodsIssueApi.getAll();
      const list: GoodsIssueRow[] = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? (res.data as unknown as GoodsIssueRow[])
        : [];
      setGoodsIssues(list);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load goods issues."));
    } finally {
      setLoadingList(false);
    }
  };
  const handleSelectOrder = async (value: string) => {
  setOrderId(value);

  const oid = toNum(value, 0);

  if (oid <= 0) {
    setSelectedOrderDetail(null);
    setStoreTo("");
    setItems([]);
    return;
  }

  try {
    setLoadingOrderDetail(true);

    const res = await orderApi.getById(oid);
    const detail = res?.data as OrderDetail | undefined;

    if (!detail) {
      setSelectedOrderDetail(null);
      setStoreTo("");
      setItems([]);
      toast.error("Failed to load order details.");
      return;
    }

    setSelectedOrderDetail(detail);
    setStoreTo(String(detail.store_id ?? ""));

    const mappedItems: ItemRow[] = Array.isArray(detail.items)
      ? detail.items.map((it) => ({
          product_id: toNum(it.product_id, 0),
          quantity: toNum(it.quantity, 1),
        }))
      : [];

    setItems(mappedItems);
  } catch (e: unknown) {
    setSelectedOrderDetail(null);
    setStoreTo("");
    setItems([]);
    toast.error(getErrorMessage(e, "Failed to load order details."));
  } finally {
    setLoadingOrderDetail(false);
  }
};

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoadingList(true);

      const [oRes, pRes, sRes, giRes] = await Promise.all([
        orderApi.getAll(),
        productApi.getAll(),
        storeApi.getAll(),
        goodsIssueApi.getAll(),
      ]);

      const oList: OrderRow[] = Array.isArray((oRes as GetOrdersResponse)?.data)
        ? ((oRes as GetOrdersResponse).data as OrderRow[])
        : [];
      setOrders(oList);

      const pList: ProductItem[] = Array.isArray((pRes as ProductListResponse)?.data)
        ? ((pRes as ProductListResponse).data as ProductItem[])
        : [];
      setProducts(pList);

      const sList: Store[] = Array.isArray(sRes?.data?.data)
        ? (sRes.data.data as Store[])
        : [];
      setStores(sList);

      const giList: GoodsIssueRow[] = Array.isArray(giRes?.data?.data)
        ? giRes.data.data
        : Array.isArray(giRes?.data)
        ? (giRes.data as unknown as GoodsIssueRow[])
        : [];
      setGoodsIssues(giList);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load data."));
    } finally {
      setLoadingList(false);
    }
  };

  void fetchData();
}, []);


    
  useEffect(() => {
  const updateContentBounds = () => {
    const mainEl = document.getElementById("ckstaff-main");
    const contentShellEl = document.getElementById("ckstaff-content-shell");
    const sidebarEl = document.getElementById("ckstaff-sidebar");

    if (mainEl) {
      const rect = mainEl.getBoundingClientRect();
      setContentLeft(rect.left);
      setContentWidth(rect.width);
      return;
    }

    if (contentShellEl) {
      const rect = contentShellEl.getBoundingClientRect();
      setContentLeft(rect.left);
      setContentWidth(rect.width);
      return;
    }

    if (sidebarEl) {
      const rect = sidebarEl.getBoundingClientRect();
      const left = rect.right;
      setContentLeft(left);
      setContentWidth(window.innerWidth - left);
      return;
    }

    setContentLeft(0);
    setContentWidth(window.innerWidth);
  };

  updateContentBounds();
  window.addEventListener("resize", updateContentBounds);

  return () => {
    window.removeEventListener("resize", updateContentBounds);
  };
}, []);

  const updateItem = (idx: number, key: keyof ItemRow, value: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const openModalCreate = () => {
  const oid = toNum(orderId, 0);

  if (oid <= 0) {
    toast.error("Please select an order first.");
    return;
  }

  if (!selectedOrderDetail) {
    toast.error("Order detail is not ready yet.");
    return;
  }

  if (items.length === 0) {
    toast.error("This order has no items.");
    return;
  }

  setOpenCreateModal(true);
};

const closeModalCreate = () => {
  if (submittingModal) return;
  setOpenCreateModal(false);
};
  

  

  const onConfirmCreate = async () => {
  const oid = toNum(orderId, 0);
  const st = toNum(storeTo, 0);

  if (oid <= 0) {
    toast.error("Please select an order.");
    return;
  }

  if (st <= 0) {
  toast.error("Store information was not found for this order.");
  return;
}

  const cleaned = items
    .map((it) => ({
      product_id: toNum(it.product_id, 0),
      quantity: toNum(it.quantity, 0),
    }))
    .filter((it) => it.product_id > 0 && it.quantity > 0);

  if (cleaned.length === 0) {
    toast.error("Please enter a valid quantity greater than 0.");
    return;
  }

  try {
    
    setSubmittingModal(true);

    await goodsIssueApi.create({
      order_id: oid,
      store_to: st,
      items: cleaned,
    });

    toast.success("Goods issue created successfully.");

    setOpenCreateModal(false);
    setOrderId("");
    setStoreTo("");
    setSelectedOrderDetail(null);
    setItems([]);

    await refreshList();
  } catch (e: unknown) {
    toast.error(getErrorMessage(e, "Failed to create goods issue."));
  } finally {
    
    setSubmittingModal(false);
  }
};

  const onComplete = async (id: number) => {
    try {
      await goodsIssueApi.complete(id);
      toast.success("Goods issue completed successfully.");
      await refreshList();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to complete goods issue."));
    }
  };

  return (
  <div>
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
            

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <select
  value={orderId}
  onChange={(e) => void handleSelectOrder(e.target.value)}
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
                {orders.map((o) => (
  <option key={o.id} value={String(o.id)}>
    {o.order_code}
  </option>
))}
              </select>

              
            </div>

            {orderId && !loadingOrderDetail && items.length === 0 && (
  <div style={{ marginBottom: 10, color: "#777" }}>
    This order has no items.
  </div>
)}
{selectedOrderDetail && (
  <div
    style={{
      marginBottom: 12,
      padding: 12,
      border: "1px solid #eee",
      borderRadius: 12,
      background: "#fafafa",
    }}
  >
    <div style={{ fontWeight: 700, marginBottom: 6 }}>Selected Order Info</div>
    <div style={{ display: "grid", gap: 6 }}>
      <div>
        <b>Order:</b> {selectedOrderDetail.order_code}
      </div>
      <div>
        <b>Restaurant:</b>{" "}
        {storeMap.get(toNum(selectedOrderDetail.store_id, 0)) ?? `Store ${selectedOrderDetail.store_id}`}
      </div>
      <div>
        <b>Order Date:</b> {formatDateOnly(selectedOrderDetail.order_date)}
      </div>
      <div>
        <b>Delivery Date:</b> {formatDateOnly(selectedOrderDetail.delivery_date)}
      </div>
      <div>
        <b>Status:</b> {selectedOrderDetail.status}
      </div>
      <div>
        <b>Products:</b> {selectedOrderDetail.items?.length ?? 0}
      </div>
    </div>
  </div>
)}
            

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              

             <button
  onClick={openModalCreate}
  disabled={loadingOrderDetail || !orderId || items.length === 0}
  style={{
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor:
      loadingOrderDetail || !orderId || items.length === 0
        ? "not-allowed"
        : "pointer",
    opacity:
      loadingOrderDetail || !orderId || items.length === 0
        ? 0.7
        : 1,
  }}
>
  {loadingOrderDetail ? "Loading order..." : "Create Goods Issue"}
</button>
            </div>
          </div>

          {/* LIST */}
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Goods Issues List</div>

          <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 14, background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Issue Code</th>
                  
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Store From</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Store To</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Status</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Created At</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {goodsIssues.map((gi) => {
                  const st = normStatus(gi?.status as GoodsIssueStatus);
                  const canComplete = st !== "COMPLETED";
                  return (
                    <tr key={gi.id}>
                      
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{gi.issue_code}</td>
                      
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
  {storeMap.get(toNum(gi.store_from, 0)) ?? ""}
</td>
<td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
  {storeMap.get(toNum(gi.store_to, 0)) ?? ""}
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
                    <td colSpan={6} style={{ padding: 14, textAlign: "center", color: "#777" }}>
                      No goods issues found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>



{openCreateModal &&
  selectedOrderDetail &&
  createPortal(
        <div
  onClick={closeModalCreate}
  style={{
    position: "fixed",
    top: 0,
    left: contentLeft,
    width: contentWidth,
    height: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 16,
    paddingTop: 24,
    paddingBottom: 24,
    zIndex: 999999,
    overflowY: "auto",
    boxSizing: "border-box",
  }}
>
            <div
  onClick={(e) => e.stopPropagation()}
  style={{
    width: "min(900px, 100%)",
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    margin: "auto",
    boxSizing: "border-box",
  }}
>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingTop: 24,

            marginBottom: 16,
            gap: 12,
            position: "sticky",
            top: 0,
            background: "#fff",
            paddingBottom: 24,
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Create Goods Issue</div>
            <div style={{ color: "#666", marginTop: 4 }}>
              Review order information and enter issued quantities.
            </div>
          </div>

          <button
            onClick={closeModalCreate}
            disabled={submittingModal}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: submittingModal ? "not-allowed" : "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 14,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Order Information</div>
            <div><b>Order ID:</b> {selectedOrderDetail.id}</div>
            <div><b>Order Code:</b> {selectedOrderDetail.order_code}</div>
            <div><b>Order Date:</b> {formatDateOnly(selectedOrderDetail.order_date)}</div>
            <div><b>Delivery Date:</b> {formatDateOnly(selectedOrderDetail.delivery_date)}</div>
            <div><b>Status:</b> {selectedOrderDetail.status}</div>
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 14,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Restaurant Information</div>
            <div><b>Store ID:</b> {selectedOrderDetail.store_id}</div>
            <div>
              <b>Restaurant:</b>{" "}
              {storeMap.get(toNum(selectedOrderDetail.store_id, 0)) ?? `Store ${selectedOrderDetail.store_id}`}
            </div>
            <div><b>Store To:</b> {storeTo}</div>
          </div>
        </div>

        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          Products Ordered By Franchise Store
        </div>

        <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  Product ID
                </th>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  Product Name
                </th>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  FR Ordered Qty
                </th>
                <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                  Issue Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderDetail.items?.map((orderItem, idx) => {
                const currentQty = items[idx]?.quantity ?? 0;
                const pid = toNum(orderItem.product_id, 0);

                return (
                  <tr key={orderItem.order_item_id ?? `${pid}-${idx}`}>
                    <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>{pid}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                      {productMap.get(pid) || `Product ${pid}`}
                    </td>
                    <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                      {toNum(orderItem.quantity, 0)}
                    </td>
                    <td style={{ padding: 12, borderBottom: "1px solid #f1f1f1" }}>
                      <input
                        type="number"
                        min={1}
                        value={currentQty}
                        onChange={(e) => {
                          const orderedQty = toNum(orderItem.quantity, 0);
                          const nextQty = toNum(e.target.value, 1);
                          updateItem(idx, "quantity", Math.min(nextQty, orderedQty));
                        }}
                        style={{
                          height: 40,
                          width: 140,
                          padding: "0 12px",
                          borderRadius: 12,
                          border: "1px solid #ddd",
                          background: "#fff",
                        }}
                      />
                    </td>
                  </tr>
                );
              })}

              {(selectedOrderDetail.items?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 14, textAlign: "center", color: "#777" }}>
                    This order has no items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
            flexWrap: "wrap",
            position: "sticky",
            bottom: 0,
            background: "#fff",
            paddingTop: 12,
          }}
        >
          <button
            onClick={closeModalCreate}
            disabled={submittingModal}
            style={{
              height: 42,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: submittingModal ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirmCreate}
            disabled={submittingModal}
            style={{
              height: 42,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: submittingModal ? "not-allowed" : "pointer",
              opacity: submittingModal ? 0.7 : 1,
            }}
          >
            {submittingModal ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}


                </div>
      </div>
    </div>
  </div>
  );
}
