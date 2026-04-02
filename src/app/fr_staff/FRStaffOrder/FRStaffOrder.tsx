import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Truck,
  Hourglass,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Card from "../../../components/Card";
import axiosClient from "../../../api/axiosClient";
import orderApi, { type OrderRow, type OrderStatus } from "../../../api/orderApi";
import productApi, { type ProductItem } from "../../../api/productApi";
import { storeApi } from "../../../api/store.api";
import type { Store } from "../../../types/store.type";

/* =========================
   TYPES
========================= */

type OrderItemRow = {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
};

type OrderDetail = {
  id: number;
  order_code: string;
  store_id: number;
  order_date: string;
  delivery_date: string;
  status: OrderStatus;
  total_amount: number | string;
  created_by: number | null;
  confirmed_by: number | null;
  issued_by: number | null;
  items?: OrderItemRow[];
};

type CreateRow = {
  product_id: number | "";
  quantity: number | "";
  unit_price: number;
};

type ErrorShape = {
  message?: string;
  response?: { data?: { message?: string } };
};

/* =========================
   HELPERS
========================= */

function toNumber(v: string | number | undefined) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function formatMoney(v: string | number) {
  return toNumber(v).toLocaleString("vi-VN");
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("vi-VN");
}

function normStatus(s: OrderStatus) {
  return String(s || "").toUpperCase();
}

function canCancel(s: OrderStatus) {
  return normStatus(s) === "SUBMITTED";
}

function getErrorMessage(e: unknown, fallback: string) {
  const err = e as ErrorShape;
  return err?.response?.data?.message || err?.message || fallback;
}

function getProductSku(products: ProductItem[], productId: number) {
  const found = products.find((p) => Number(p.id) === Number(productId));
  if (!found) return "-";

  const sku =
    (found as ProductItem & { sku?: string }).sku ??
    (found as ProductItem & { product_sku?: string }).product_sku;

  return sku ? String(sku) : "-";
}

/* =========================
   SMALL UI
========================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold mt-1 break-words">{value}</div>
    </div>
  );
}

/* =========================
   PAGE
========================= */

export default function FRStaffOrder() {
  /* =========================
     STATE
  ========================= */

  // master data
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // list
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // create
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createDeliveryDate, setCreateDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [createRows, setCreateRows] = useState<CreateRow[]>([
    { product_id: "", quantity: 1, unit_price: 0 },
  ]);

  // detail
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailCache, setDetailCache] = useState<Record<number, OrderDetail>>({});

  // cancel
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState<OrderRow | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  

  const fetchAll = useCallback(async (showRefreshing = false) => {
    setError("");

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await orderApi.getAll();
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Load orders failed"));
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productApi.getAll();
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const res = await storeApi.getAll();
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setStores(data);
    } catch (e) {
      console.error(e);
      setStores([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchAll(false), fetchProducts(), fetchStores()]);
    };

    void init();
  }, [fetchAll, fetchProducts, fetchStores]);

  /* =========================
     MEMO
  ========================= */

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((o) => {
      const matchSearch =
        !q || String(o.order_code || "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : normStatus(o.status) === normStatus(statusFilter);

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const storeMap = useMemo(() => {
    return new Map<number, string>(
      stores.map((s) => [Number(s.id), String(s.name)])
    );
  }, [stores]);

  const totalOrders = orders.length;

  const submittedCount = useMemo(
    () => orders.filter((o) => normStatus(o.status) === "SUBMITTED").length,
    [orders]
  );

  const issuedCount = useMemo(
    () => orders.filter((o) => normStatus(o.status) === "ISSUED").length,
    [orders]
  );

  const deliveredCount = useMemo(
    () => orders.filter((o) => normStatus(o.status) === "DELIVERED").length,
    [orders]
  );

  /* =========================
     DETAIL ACTIONS
  ========================= */

  const openOrderDetail = async (orderId: number) => {
    setOpenDetail(true);
    setDetailError("");

    const cached = detailCache[orderId];
    if (cached) {
      setDetail(cached);
      setDetailLoading(false);
      return;
    }

    setDetail(null);
    setDetailLoading(true);

    try {
      const res = await axiosClient.get<{ data: OrderDetail }>(`/orders/${orderId}`);
      const data = (res.data as { data?: OrderDetail }).data ?? null;

      if (data && typeof data.id === "number") {
        setDetail(data);
        setDetailCache((prev) => ({ ...prev, [orderId]: data }));
      } else {
        setDetail(null);
        setDetailError("Order detail response is invalid");
      }
    } catch (e: unknown) {
      setDetailError(getErrorMessage(e, "Load order detail failed"));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setOpenDetail(false);
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  };

  /* =========================
     CANCEL ACTIONS
  ========================= */

  const openCancelConfirm = (order: OrderRow) => {
    setCancelingOrder(order);
    setOpenCancelModal(true);
  };

  const closeCancelConfirm = () => {
    if (cancelLoading) return;
    setOpenCancelModal(false);
    setCancelingOrder(null);
  };

  const confirmCancelOrder = async () => {
    if (!cancelingOrder) return;

    setError("");
    setCancelLoading(true);

    try {
      await orderApi.cancel(cancelingOrder.id);
      toast.success("Order cancelled successfully");
      setOpenCancelModal(false);
      setCancelingOrder(null);
      await fetchAll(true);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Cancel order failed"));
    } finally {
      setCancelLoading(false);
    }
  };

  /* =========================
     CREATE ACTIONS
  ========================= */

  const addRow = () => {
    setCreateRows((prev) => [
      ...prev,
      { product_id: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeRow = (idx: number) => {
    setCreateRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const setRow = (idx: number, patch: Partial<CreateRow>) => {
    setCreateRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  const getProductUnitPrice = (productId: number): number => {
    const product = products.find((p) => Number(p.id) === Number(productId));
    if (!product) return 0;

    const raw =
      (product as ProductItem & { unit_price?: number | string }).unit_price ?? 0;

    return toNumber(raw);
  };

  const resetCreateForm = () => {
    setCreateRows([{ product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const submitCreate = async () => {
    const delivery_date = createDeliveryDate.trim();

    if (!delivery_date) {
      toast.error("Please select delivery date");
      return;
    }

    const items = createRows
      .map((row) => ({
        product_id:
          typeof row.product_id === "string"
            ? Number(row.product_id)
            : row.product_id,
        quantity:
          typeof row.quantity === "string"
            ? Number(row.quantity)
            : row.quantity,
        unit_price: row.unit_price,
      }))
      .filter((row) => Number.isFinite(row.product_id) && row.product_id > 0)
      .map((row) => ({
        product_id: Number(row.product_id),
        quantity: Math.max(1, Number(row.quantity) || 1),
        unit_price: Math.max(0, Number(row.unit_price) || 0),
      }));

    if (items.length === 0) {
      toast.error("Please add at least 1 item");
      return;
    }

    setCreating(true);

    try {
      await orderApi.create({ delivery_date, items });
      toast.success("Order created successfully");
      resetCreateForm();
      setOpenCreate(false);
      await fetchAll(true);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Create order failed"));
    } finally {
      setCreating(false);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          title="Total Orders"
          value={totalOrders}
          subtext="All orders"
          borderColor="border-blue-500"
          icon={<ClipboardList className="w-7 h-7 text-blue-600" />}
        />
        <Card
          title="Submitted"
          value={submittedCount}
          subtext="Waiting for confirmation"
          borderColor="border-yellow-500"
          icon={<Hourglass className="w-7 h-7 text-yellow-600" />}
        />
        <Card
          title="Issued"
          value={issuedCount}
          subtext="Ready for delivery"
          borderColor="border-orange-500"
          icon={<Truck className="w-7 h-7 text-orange-600" />}
        />
        <Card
          title="Delivered"
          value={deliveredCount}
          subtext="Completed orders"
          borderColor="border-green-500"
          icon={<CheckCircle2 className="w-7 h-7 text-green-600" />}
        />
      </div>

      {/* HEADER / FILTER */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="text-lg font-semibold">Orders List</div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </button>

            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order code..."
              className="w-full md:w-[260px] px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="ALL">All Status</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ISSUED">ISSUED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {loading ? <div className="mt-3 text-gray-500">Loading...</div> : null}
        {error ? <div className="mt-3 text-red-600">{error}</div> : null}
      </div>

      {/* LIST TABLE */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap">Order Code</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Store</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Order Date</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Delivery Date</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Actions</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">View</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{order.order_code}</td>
                  <td className="px-4 py-3">
                    {storeMap.get(Number(order.store_id)) || "-"}
                  </td>
                  <td className="px-4 py-3">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3">{formatDate(order.delivery_date)}</td>
                  <td className="px-4 py-3">{formatMoney(order.total_amount)}</td>
                  <td className="px-4 py-3">{normStatus(order.status)}</td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {canCancel(order.status) ? (
                        <button
                          disabled={loading || refreshing || cancelLoading}
                          onClick={() => openCancelConfirm(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-60"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOrderDetail(order.id)}
                      className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 text-gray-600 hover:text-orange-500" />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filteredOrders.length === 0 ? (
                <tr className="border-t">
                  <td className="px-4 py-6 text-gray-500" colSpan={8}>
                    No orders
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {openCreate ? (
        <div className="fixed top-0 right-0 bottom-0 left-0 md:left-[260px] bg-black/40 flex items-center justify-center p-4 z-[9999]">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">Create Order</div>
                <div className="text-xs text-gray-500">Add items then submit</div>
              </div>

              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Delivery date</label>
                  <input
                    type="date"
                    value={createDeliveryDate}
                    onChange={(e) => setCreateDeliveryDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                {products.length === 0 ? (
                  <div className="text-xs text-gray-400">
                    Products not loaded (cannot select product)
                  </div>
                ) : null}
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Items</div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-white text-gray-700">
                      <tr className="border-b">
                        <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Qty</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Unit Price</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Line Total</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Remove</th>
                      </tr>
                    </thead>

                    <tbody>
                      {createRows.map((row, idx) => {
                        const lineTotal = toNumber(row.quantity) * toNumber(row.unit_price);

                        return (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-3 min-w-[280px]">
                              <select
                                value={row.product_id}
                                onChange={(e) => {
                                  const productId = e.target.value ? Number(e.target.value) : "";
                                  const unitPrice =
                                    typeof productId === "number"
                                      ? getProductUnitPrice(productId)
                                      : 0;

                                  setRow(idx, {
                                    product_id: productId,
                                    unit_price: unitPrice,
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
                              >
                                <option value="">Select product...</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (#{p.id})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-3 w-[140px]">
                              <input
                                type="number"
                                min={1}
                                value={row.quantity}
                                onChange={(e) =>
                                  setRow(idx, {
                                    quantity: e.target.value === "" ? "" : Number(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                              />
                            </td>

                            <td className="px-4 py-3 w-[180px]">
                              <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
                                {row.product_id === "" ? "-" : formatMoney(row.unit_price)}
                              </div>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">
                              {row.product_id === "" ? "-" : formatMoney(lineTotal)}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                type="button"
                                disabled={createRows.length === 1}
                                onClick={() => removeRow(idx)}
                                className={[
                                  "inline-flex items-center gap-2 px-3 py-2 rounded-xl border",
                                  createRows.length === 1
                                    ? "border-gray-200 bg-gray-50 text-gray-400"
                                    : "border-red-200 bg-red-50 hover:bg-red-100 text-red-700",
                                ].join(" ")}
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add item
                </button>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenCreate(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    disabled={creating}
                    onClick={submitCreate}
                    className={[
                      "inline-flex items-center justify-center px-5 py-2 rounded-xl text-white",
                      creating ? "bg-orange-300" : "bg-orange-500 hover:bg-orange-600",
                    ].join(" ")}
                  >
                    {creating ? "Creating..." : "Create Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* CANCEL MODAL */}
      {openCancelModal ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold text-lg text-red-600">Confirm Cancel</div>
              <button
                onClick={closeCancelConfirm}
                disabled={cancelLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-700">
                Are you sure you want to cancel this order?
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Order Code:</span>{" "}
                  <span className="font-semibold">{cancelingOrder?.order_code ?? "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Store:</span>{" "}
                  <span className="font-semibold">
                    {cancelingOrder
                      ? storeMap.get(Number(cancelingOrder.store_id)) || "-"
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className="font-semibold">
                    {cancelingOrder ? normStatus(cancelingOrder.status) : "-"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeCancelConfirm}
                  disabled={cancelLoading}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60"
                >
                  No
                </button>

                <button
                  onClick={confirmCancelOrder}
                  disabled={cancelLoading}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {cancelLoading ? "Canceling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* DETAIL MODAL */}
      {openDetail ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold text-lg">Order Detail</div>
              <button
                onClick={closeDetail}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4">
              {detailLoading ? <div className="text-gray-500">Loading...</div> : null}
              {detailError ? <div className="text-red-600">{detailError}</div> : null}

              {detail ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Info label="Order Code" value={detail.order_code} />
                    <Info
                      label="Store"
                      value={storeMap.get(Number(detail.store_id)) || String(detail.store_id)}
                    />
                    <Info label="Status" value={normStatus(detail.status)} />
                    <Info label="Total Amount" value={formatMoney(detail.total_amount)} />
                    <Info label="Order Date" value={formatDate(detail.order_date)} />
                    <Info label="Delivery Date" value={formatDate(detail.delivery_date)} />
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b font-semibold">Items</div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                          <tr>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">SKU</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Quantity</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Unit Price</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(Array.isArray(detail.items) ? detail.items : []).map((item) => (
                            <tr key={item.order_item_id} className="border-t">
                              <td className="px-4 py-3">
                                <div className="font-medium">{item.product_name}</div>
                              </td>
                              <td className="px-4 py-3">
                                {getProductSku(products, item.product_id)}
                              </td>
                              <td className="px-4 py-3">{toNumber(item.quantity)}</td>
                              <td className="px-4 py-3">{formatMoney(item.unit_price)}</td>
                              <td className="px-4 py-3">{formatMoney(item.total_price)}</td>
                            </tr>
                          ))}

                          {!detail.items || detail.items.length === 0 ? (
                            <tr className="border-t">
                              <td className="px-4 py-6 text-gray-500" colSpan={5}>
                                No items
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}