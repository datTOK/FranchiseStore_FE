import { useEffect, useMemo, useState } from "react";
import { ClipboardList, CheckCircle2, Truck, Hourglass, Plus, RefreshCw } from "lucide-react";
import Card from "../../../components/Card";
import orderApi, { type CreateOrderPayload, type OrderRow, type OrderStatus } from "../../../api/orderApi";
import inventoryApi, { type ProductItem } from "../../../api/inventoryApi";
import axiosClient from "../../../api/axiosClient";

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

export default function StaffOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const [openCreate, setOpenCreate] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState<Array<{ product_id: number; quantity: number; unit_price: number }>>([
    { product_id: 0, quantity: 1, unit_price: 0 },
  ]);

  // Detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  
  const [detailCache, setDetailCache] = useState<Record<number, OrderDetail>>({});

  const fetchAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [o, p] = await Promise.all([orderApi.getAll(), inventoryApi.getAll()]);
      setOrders(Array.isArray(o?.data) ? o.data : []);
      setProducts(Array.isArray(p?.data) ? p.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Load orders failed");
      setOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return orders.filter((o) => {
      const matchSearch = !q || String(o.id).includes(q) || String(o.order_code || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" ? true : normStatus(o.status) === normStatus(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const total = orders.length;
  const pending = useMemo(() => orders.filter((o) => normStatus(o.status) === "SUBMITTED").length, [orders]);
  const issued = useMemo(() => orders.filter((o) => normStatus(o.status) === "ISSUED").length, [orders]);
  const delivered = useMemo(() => orders.filter((o) => normStatus(o.status) === "DELIVERED").length, [orders]);

  const onAction = async (fn: () => Promise<any>) => {
    setError("");
    setLoading(true);
    try {
      await fn();
      await fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { product_id: 0, quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (
    idx: number,
    patch: Partial<{ product_id: number; quantity: number; unit_price: number }>
  ) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const submitCreate = async () => {
    const payload: CreateOrderPayload = {
      delivery_date: deliveryDate,
      items: items
        .filter((x) => Number(x.product_id) > 0 && Number(x.quantity) > 0 && Number(x.unit_price) > 0)
        .map((x) => ({
          product_id: Number(x.product_id),
          quantity: Number(x.quantity),
          unit_price: Number(x.unit_price),
        })),
    };

    if (!payload.delivery_date) {
      setError("Please choose delivery_date");
      return;
    }
    if (payload.items.length === 0) {
      setError("Please select at least 1 item with quantity > 0 and unit_price > 0");
      return;
    }

    await onAction(async () => {
      await orderApi.create(payload);
      setOpenCreate(false);
      setDeliveryDate("");
      setItems([{ product_id: 0, quantity: 1, unit_price: 0 }]);
    });
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
      const res = await axiosClient.get<{ data: OrderDetail }>(`/orders/${orderId}`);
      const d = (res as any)?.data?.data || (res as any)?.data || null;

      if (d && typeof d?.id === "number") {
        setDetail(d);
        setDetailCache((prev) => ({ ...prev, [orderId]: d }));
      } else {
        setDetail(null);
        setDetailError("Order detail response is invalid");
      }
    } catch (e: any) {
      setDetailError(e?.response?.data?.message || e?.message || "Load order detail failed");
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Manage Store Orders</h2>
      <p className="text-gray-600 mb-6">Manage your store's current orders and status</p>

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

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <button
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
              {filtered.map((o) => (
                <tr key={o.id} className="border-t">
                  {/* ID & Order  */}
                  <td className="px-4 py-3">{o.id}</td>
                  <td className="px-4 py-3 font-medium">{o.order_code}</td>

                  <td className="px-4 py-3">{o.store_id}</td>
                  <td className="px-4 py-3">{formatDate(o.order_date)}</td>
                  <td className="px-4 py-3">{formatDate(o.delivery_date)}</td>
                  <td className="px-4 py-3">{formatMoney(o.total_amount)}</td>
                  <td className="px-4 py-3">{normStatus(o.status)}</td>

                  

                  {/* Actions */}
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
                  {/* View */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOrderDetail(o.id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      View
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

      {/* CREATE MODAL */}
      {openCreate ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold text-lg">Create Order</div>
              <button
                onClick={() => setOpenCreate(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Delivery date</div>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Items</div>

                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-6">
                      <div className="text-xs text-gray-600 mb-1">Product</div>
                      <select
                        value={it.product_id}
                        onChange={(e) => updateItem(idx, { product_id: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
                      >
                        <option value={0}>Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <div className="text-xs text-gray-600 mb-1">Quantity</div>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <div className="text-xs text-gray-600 mb-1">Unit price</div>
                      <input
                        type="number"
                        min={0}
                        value={it.unit_price}
                        onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="Price"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <button
                    onClick={addItemRow}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    + Add item
                  </button>
                </div>
              </div>

              {error ? <div className="text-red-600">{error}</div> : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCreate}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  Create
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
                    <Info label="Store ID" value={String(detail.store_id)} />
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
                            <th className="text-left px-4 py-3 whitespace-nowrap">Item ID</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Qty</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Unit Price</th>
                            <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(detail.items) ? detail.items : []).map((it) => (
                            <tr key={it.order_item_id} className="border-t">
                              <td className="px-4 py-3">{it.order_item_id}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium">{it.product_name}</div>
                                <div className="text-xs text-gray-500">#{it.product_id}</div>
                              </td>
                              <td className="px-4 py-3">{toNumber(it.quantity)}</td>
                              <td className="px-4 py-3">{formatMoney(it.unit_price)}</td>
                              <td className="px-4 py-3">{formatMoney(it.total_price)}</td>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold mt-1 break-words">{value}</div>
    </div>
  );
}