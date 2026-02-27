import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Truck,
  Hourglass,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../components/Card";
import orderApi, { type OrderRow, type OrderStatus } from "../../../api/orderApi";
import axiosClient from "../../../api/axiosClient";
import productApi, { type ProductItem } from "../../../api/productApi";

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
  created_by: any;
  confirmed_by: any;
  issued_by: any;
  items?: OrderItemRow[];
};

type CreateRow = {
  product_id: number | "";
  quantity: number | "";
  unit_price: number | "";
};

function toNumber(v: any) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(v: string | number) {
  const n = toNumber(v);
  return n.toLocaleString("vi-VN");
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

function canConfirm(s: OrderStatus) {
  return normStatus(s) === "SUBMITTED";
}

function canIssue(s: OrderStatus) {
  return normStatus(s) === "CONFIRMED";
}

function canDeliver(s: OrderStatus) {
  return normStatus(s) === "ISSUED";
}

export default function FRStaffOrder() {
  // Create form
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [createDeliveryDate, setCreateDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [createRows, setCreateRows] = useState<CreateRow[]>([
    { product_id: "", quantity: 1, unit_price: "" },
  ]);
  const [creating, setCreating] = useState(false);

  // List
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);

  // Detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const [detailCache, setDetailCache] = useState<Record<number, OrderDetail>>(
    {}
  );

  const fetchAll = async () => {
    setError("");
    setLoading(true);
    try {
      const o = await orderApi.getAll();
      setOrders(Array.isArray(o?.data) ? o.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Load orders failed");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        String(o.id).includes(q) ||
        String(o.order_code || "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "ALL"
          ? true
          : normStatus(o.status) === normStatus(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const total = orders.length;
  const pending = useMemo(
    () => orders.filter((o) => normStatus(o.status) === "SUBMITTED").length,
    [orders]
  );
  const issued = useMemo(
    () => orders.filter((o) => normStatus(o.status) === "ISSUED").length,
    [orders]
  );
  const delivered = useMemo(
    () => orders.filter((o) => normStatus(o.status) === "DELIVERED").length,
    [orders]
  );

  const onAction = async (fn: () => Promise<any>) => {
    setError("");
    setLoading(true);
    try {
      await fn();
      await fetchAll();
      toast.success("Success");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Action failed");
      toast.error(e?.response?.data?.message || e?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

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
      const res = await axiosClient.get<{ data: OrderDetail }>(
        `/orders/${orderId}`
      );
      const d = (res as any)?.data?.data || (res as any)?.data || null;

      if (d && typeof d?.id === "number") {
        setDetail(d);
        setDetailCache((prev) => ({ ...prev, [orderId]: d }));
      } else {
        setDetail(null);
        setDetailError("Order detail response is invalid");
      }
    } catch (e: any) {
      setDetailError(
        e?.response?.data?.message || e?.message || "Load order detail failed"
      );
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

  const createTotal = useMemo(() => {
    return createRows.reduce(
      (sum, r) => sum + toNumber(r.quantity) * toNumber(r.unit_price),
      0
    );
  }, [createRows]);

  const addRow = () => {
    setCreateRows((prev) => [
      ...prev,
      { product_id: "", quantity: 1, unit_price: "" },
    ]);
  };

  const removeRow = (idx: number) => {
    setCreateRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const setRow = (idx: number, patch: Partial<CreateRow>) => {
    setCreateRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };

  const submitCreate = async () => {
    const delivery_date = (createDeliveryDate || "").trim();
    if (!delivery_date) {
      toast.error("Please select delivery date");
      return;
    }

    const items = createRows
      .map((r) => ({
        product_id:
          typeof r.product_id === "string" ? Number(r.product_id) : r.product_id,
        quantity:
          typeof r.quantity === "string" ? Number(r.quantity) : r.quantity,
        unit_price:
          typeof r.unit_price === "string" ? Number(r.unit_price) : r.unit_price,
      }))
      .filter((r) => Number.isFinite(r.product_id) && r.product_id > 0)
      .map((r) => ({
        product_id: Number(r.product_id),
        quantity: Math.max(1, Number(r.quantity) || 1),
        unit_price: Math.max(0, Number(r.unit_price) || 0),
      }));

    if (items.length === 0) {
      toast.error("Please add at least 1 item");
      return;
    }

    setCreating(true);
    try {
      await orderApi.create({ delivery_date, items });
      toast.success("Order created successfully");
      setCreateRows([{ product_id: "", quantity: 1, unit_price: "" }]);
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Create order failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Manage Store Orders</h2>
      <p className="text-gray-600 mb-6">
        FR Staff can create orders and manage order status
      </p>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          title="Total Orders"
          value={total}
          subtext="All orders"
          borderColor="border-blue-500"
          icon={<ClipboardList className="w-7 h-7 text-blue-600" />}
        />
        <Card
          title="Pending"
          value={pending}
          subtext="Waiting confirm"
          borderColor="border-yellow-500"
          icon={<Hourglass className="w-7 h-7 text-yellow-600" />}
        />
        <Card
          title="Issued"
          value={issued}
          subtext="On the way"
          borderColor="border-orange-500"
          icon={<Truck className="w-7 h-7 text-orange-600" />}
        />
        <Card
          title="Delivered"
          value={delivered}
          subtext="Done"
          borderColor="border-green-500"
          icon={<CheckCircle2 className="w-7 h-7 text-green-600" />}
        />
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="text-lg font-semibold">Orders List</div>

          {/* BUTTONS: Create nằm bên trái Refresh */}
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
              onClick={fetchAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Order code..."
              className="w-full md:w-[260px] px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="ALL">All Status</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ISSUED">ISSUED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>
        </div>

        {loading ? <div className="mt-3 text-gray-500">Loading...</div> : null}
        {error ? <div className="mt-3 text-red-600">{error}</div> : null}
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap">ID</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Order Code
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Store</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Order Date
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Delivery Date
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Actions
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">View</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">{o.id}</td>
                  <td className="px-4 py-3 font-medium">{o.order_code}</td>

                  <td className="px-4 py-3">{o.store_id}</td>
                  <td className="px-4 py-3">{formatDate(o.order_date)}</td>
                  <td className="px-4 py-3">{formatDate(o.delivery_date)}</td>
                  <td className="px-4 py-3">{formatMoney(o.total_amount)}</td>
                  <td className="px-4 py-3">{normStatus(o.status)}</td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={!canConfirm(o.status) || loading}
                        onClick={() => onAction(() => orderApi.confirm(o.id))}
                        className={[
                          "px-3 py-1.5 rounded-lg border",
                          canConfirm(o.status)
                            ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                            : "border-gray-200 bg-gray-50 text-gray-400",
                        ].join(" ")}
                      >
                        Confirm
                      </button>

                      <button
                        disabled={!canIssue(o.status) || loading}
                        onClick={() => onAction(() => orderApi.issue(o.id))}
                        className={[
                          "px-3 py-1.5 rounded-lg border",
                          canIssue(o.status)
                            ? "border-orange-300 bg-orange-50 hover:bg-orange-100"
                            : "border-gray-200 bg-gray-50 text-gray-400",
                        ].join(" ")}
                      >
                        Issue
                      </button>

                      <button
                        disabled={!canDeliver(o.status) || loading}
                        onClick={() => onAction(() => orderApi.deliver(o.id))}
                        className={[
                          "px-3 py-1.5 rounded-lg border",
                          canDeliver(o.status)
                            ? "border-green-300 bg-green-50 hover:bg-green-100"
                            : "border-gray-200 bg-gray-50 text-gray-400",
                        ].join(" ")}
                      >
                        Deliver
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOrderDetail(o.id)}
                      className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 text-gray-600 hover:text-orange-500" />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 ? (
                <tr className="border-t">
                  <td className="px-4 py-6 text-gray-500" colSpan={9}>
                    No orders
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      
         {/* CREATE ORDER MODAL */}
      {openCreate ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
            {/* HEADER */}
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

            {/* BODY (scroll) */}
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Delivery date */}
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

              {/* Items table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 font-semibold">
                  Items
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white text-gray-700">
                      <tr className="border-b">
                        <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Qty</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Unit price</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Line total</th>
                        <th className="text-left px-4 py-3 whitespace-nowrap">Remove</th>
                      </tr>
                    </thead>

                    <tbody>
                      {createRows.map((r, idx) => {
                        const lineTotal = toNumber(r.quantity) * toNumber(r.unit_price);
                        return (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-3 min-w-[280px]">
                              <select
                                value={r.product_id}
                                onChange={(e) =>
                                  setRow(idx, {
                                    product_id: e.target.value ? Number(e.target.value) : "",
                                  })
                                }
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
                                value={r.quantity}
                                onChange={(e) =>
                                  setRow(idx, {
                                    quantity: e.target.value === "" ? "" : Number(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                              />
                            </td>

                            <td className="px-4 py-3 w-[180px]">
                              <input
                                type="number"
                                min={0}
                                value={r.unit_price}
                                onChange={(e) =>
                                  setRow(idx, {
                                    unit_price: e.target.value === "" ? "" : Number(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap font-semibold">
                              {formatMoney(lineTotal)}
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

            {/* FOOTER (fixed bottom) */}
            <div className="p-4 border-t bg-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Add */}
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add item
                </button>

                {/* Middle/Right: Total */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatMoney(createTotal)}
                  </div>
                </div>

                {/* Right: Actions */}
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
                    onClick={async () => {
                      await submitCreate();
                      setOpenCreate(false);
                    }}
                    className={[
                      "inline-flex items-center justify-center px-5 py-2 rounded-xl text-white",
                      creating ? "bg-orange-300" : "bg-orange-500 hover:bg-orange-600",
                    ].join(" ")}
                  >
                    {creating ? "Creating..." : "Create Order"}
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Tip: Total = sum(qty × unit price)
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
              {detailLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : null}
              {detailError ? (
                <div className="text-red-600">{detailError}</div>
              ) : null}

              {detail ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Info label="Order Code" value={detail.order_code} />
                    <Info label="Store ID" value={String(detail.store_id)} />
                    <Info label="Status" value={normStatus(detail.status)} />
                    <Info
                      label="Total Amount"
                      value={formatMoney(detail.total_amount)}
                    />
                    <Info label="Order Date" value={formatDate(detail.order_date)} />
                    <Info
                      label="Delivery Date"
                      value={formatDate(detail.delivery_date)}
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b font-semibold">Items</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                          <tr>
                            <th className="text-left px-4 py-3 whitespace-nowrap">
                              Item ID
                            </th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">
                              Product
                            </th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">
                              Qty
                            </th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">
                              Unit Price
                            </th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(detail.items) ? detail.items : []).map(
                            (it) => (
                              <tr key={it.order_item_id} className="border-t">
                                <td className="px-4 py-3">{it.order_item_id}</td>
                                <td className="px-4 py-3">
                                  <div className="font-medium">
                                    {it.product_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    #{it.product_id}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {toNumber(it.quantity)}
                                </td>
                                <td className="px-4 py-3">
                                  {formatMoney(it.unit_price)}
                                </td>
                                <td className="px-4 py-3">
                                  {formatMoney(it.total_price)}
                                </td>
                              </tr>
                            )
                          )}

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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold mt-1 break-words">{value}</div>
    </div>
  );
}