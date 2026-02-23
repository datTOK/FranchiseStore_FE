import { useEffect, useMemo, useState } from "react";
import { ClipboardList, CheckCircle2, Truck, Hourglass, Plus, RefreshCw } from "lucide-react";
import Card from "../../../components/Card";
import orderApi, { type CreateOrderPayload, type OrderRow, type OrderStatus } from "../../../api/orderApi";
import inventoryApi, { type ProductItem } from "../../../api/inventoryApi";

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
      const matchSearch =
        !q || String(o.id).includes(q) || String(o.order_code || "").toLowerCase().includes(q);
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

  const removeItemRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, patch: Partial<{ product_id: number; quantity: number; unit_price: number }>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const submitCreate = async () => {
    const payload: CreateOrderPayload = {
      delivery_date: deliveryDate,
      items: items
        .filter((x) => Number(x.product_id) > 0 && Number(x.quantity) > 0)
        .map((x) => ({
          product_id: Number(x.product_id),
          quantity: Number(x.quantity),
          unit_price: Number(x.unit_price),
        })),
    };

    if (!payload.delivery_date) {
      setError("Vui lòng chọn delivery_date");
      return;
    }
    if (payload.items.length === 0) {
      setError("Vui lòng chọn ít nhất 1 product_id và quantity > 0");
      return;
    }

    await onAction(async () => {
      await orderApi.create(payload);
      setOpenCreate(false);
      setDeliveryDate("");
      setItems([{ product_id: 0, quantity: 1, unit_price: 0 }]);
    });
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
                          canConfirm(o.status) ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100" : "border-gray-200 bg-gray-50 text-gray-400",
                        ].join(" ")}
                      >
                        Confirm
                      </button>

                      <button
                        disabled={!canIssue(o.status) || loading}
                        onClick={() => onAction(() => orderApi.issue(o.id))}
                        className={[
                          "px-3 py-1.5 rounded-lg border",
                          canIssue(o.status) ? "border-orange-300 bg-orange-50 hover:bg-orange-100" : "border-gray-200 bg-gray-50 text-gray-400",
                        ].join(" ")}
                      >
                        Issue
                      </button>

                      <button
                        disabled={!canDeliver(o.status) || loading}
                        onClick={() => onAction(() => orderApi.deliver(o.id))}
                        className={[
                          "px-3 py-1.5 rounded-lg border",
                          canDeliver(o.status) ? "border-green-300 bg-green-50 hover:bg-green-100" : "border-gray-200 bg-gray-50 text-gray-400",
                        ].join(" ")}
                      >
                        Deliver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 ? (
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
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-6">
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

                    <div className="md:col-span-2">
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
                      <input
                        type="number"
                        min={0}
                        value={it.unit_price}
                        onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="Unit price"
                      />
                    </div>

                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        onClick={() => removeItemRow(idx)}
                        className="w-full md:w-auto px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                        disabled={items.length === 1}
                      >
                        X
                      </button>
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
    </div>
  );
}