import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { InventoryItemApi } from "../api/inventoryApi";

type CartRow = {
  product_id: number;
  name: string;
  sku: string;
  uom: string;
  price: number;
  quantity: number;
};

type SalesOrderListRow = {
  id: number;
  sales_order_code?: string;
  order_code?: string;
  customer_name?: string;
  status?: string;
  total_amount?: number | string;
  created_at?: string;
};

type SalesOrderDetail = SalesOrderListRow & {
  items?: Array<{
    id?: number;
    order_item_id?: number;
    product_id?: number;
    product_name?: string;
    quantity?: number | string;
    unit_price?: number | string;
    total_price?: number | string;
  }>;
};

type Props = {
  inventory: InventoryItemApi[];
  filteredInventory: InventoryItemApi[];
  loadingInv: boolean;
  errorInv: string;
  search: string;
  setSearch: (v: string) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  priceByProductId: Record<number, number>;
  historySearch: string;
  setHistorySearch: (v: string) => void;
  salesOrders: SalesOrderListRow[];
  loadingSalesOrders: boolean;
  errorSalesOrders: string;
  refreshSalesOrders: () => void;
  selectedSalesOrderId: number | null;
  selectSalesOrder: (id: number) => void;
  salesOrderDetail: SalesOrderDetail | null;
  loadingSalesOrderDetail: boolean;
  errorSalesOrderDetail: string;
  cart: CartRow[];
  addToCart: (item: InventoryItemApi) => void;
  removeFromCart: (pid: number) => void;
  setCartRow: (pid: number, patch: Partial<CartRow>) => void;
  total: number;
  checkingOut: boolean;
  checkout: () => void;
};

function toNumber(v: string | number | undefined) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function formatMoney(v: string | number) {
  const n = toNumber(v);
  return n.toLocaleString("vi-VN");
}

function formatDateTime(v: string | undefined) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("vi-VN");
}

export default function FRStaffPOS(props: Props) {
  const {
    filteredInventory,
    loadingInv,
    errorInv,
    search,
    setSearch,
    customerName,
    setCustomerName,
    priceByProductId,
    historySearch,
    setHistorySearch,
    salesOrders,
    loadingSalesOrders,
    errorSalesOrders,
    refreshSalesOrders,
    selectedSalesOrderId,
    selectSalesOrder,
    salesOrderDetail,
    loadingSalesOrderDetail,
    errorSalesOrderDetail,
    cart,
    addToCart,
    removeFromCart,
    setCartRow,
    total,
    checkingOut,
    checkout,
  } = props;

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 10;

  const selectedCode = useMemo(() => {
    if (salesOrderDetail?.sales_order_code) return salesOrderDetail.sales_order_code;
    if (salesOrderDetail?.order_code) return salesOrderDetail.order_code;
    return selectedSalesOrderId ? `#${selectedSalesOrderId}` : "";
  }, [salesOrderDetail, selectedSalesOrderId]);

  const pageCount = useMemo(() => {
    const c = Math.ceil(salesOrders.length / PAGE_SIZE);
    return c > 0 ? c : 1;
  }, [salesOrders.length]);

  const effectiveHistoryPage = useMemo(() => {
    return Math.min(Math.max(1, historyPage), pageCount);
  }, [historyPage, pageCount]);

  const pagedSalesOrders = useMemo(() => {
    const start = (effectiveHistoryPage - 1) * PAGE_SIZE;
    return salesOrders.slice(start, start + PAGE_SIZE);
  }, [effectiveHistoryPage, salesOrders]);

  const billDetailTotal = useMemo(() => {
    if (!salesOrderDetail) return 0;
    const declared = toNumber(salesOrderDetail.total_amount ?? 0);
    if (declared > 0) return declared;

    return (salesOrderDetail.items || []).reduce((sum, it) => {
      const pid = Number(it.product_id ?? 0);
      const qty = toNumber(it.quantity);
      const apiTotal = it.total_price != null ? toNumber(it.total_price) : 0;
      const apiUnit = toNumber(it.unit_price);
      const mapPrice = pid > 0 ? toNumber(priceByProductId[pid]) : 0;
      const derivedFromTotal = qty > 0 && apiTotal > 0 ? apiTotal / qty : 0;
      const unit = apiUnit > 0 ? apiUnit : derivedFromTotal > 0 ? derivedFromTotal : mapPrice;
      const line = apiTotal > 0 ? apiTotal : qty * unit;
      return sum + line;
    }, 0);
  }, [priceByProductId, salesOrderDetail]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Point of Sale</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, Name..."
              className="w-[280px] px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {loadingInv ? <div className="text-gray-500">Loading inventory...</div> : null}
          {errorInv ? <div className="text-red-600">{errorInv}</div> : null}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">SKU & Name</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Quantity</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((it) => {
                  const available = toNumber(it.available_quantity ?? it.quantity);
                  return (
                    <tr key={it.product_id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.sku}</div>
                      </td>
                      <td className="px-4 py-3">{available}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => addToCart(it)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loadingInv && filteredInventory.length === 0 ? (
                  <tr className="border-t">
                    <td className="px-4 py-6 text-gray-500" colSpan={3}>
                      No products
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="text-lg font-semibold">Bill</div>
            <button
              type="button"
              onClick={() => {
                setHistoryPage(1);
                refreshSalesOrders();
                setHistoryOpen(true);
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            >
              History
            </button>
          </div>

          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Customer name</div>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Quantity</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Price</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Line Total</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((r) => {
                    const lineTotal = toNumber(r.quantity) * toNumber(r.price);
                    return (
                      <tr key={r.product_id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-gray-500">
                            #{r.product_id} · {r.sku}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={1}
                            value={r.quantity}
                            onChange={(e) =>
                              setCartRow(r.product_id, {
                                quantity: e.target.value === "" ? 1 : Number(e.target.value),
                              })
                            }
                            className="w-[100px] px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="whitespace-nowrap">{formatMoney(r.price)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold">
                          {formatMoney(lineTotal)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeFromCart(r.product_id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {cart.length === 0 ? (
                    <tr className="border-t">
                      <td className="px-4 py-6 text-gray-500" colSpan={5}>
                        No items
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-xl font-bold text-orange-600">{formatMoney(total)}</div>
            </div>

            <div className="flex items-center justify-end mt-4">
              <button
                type="button"
                disabled={checkingOut}
                onClick={checkout}
                className="px-5 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {checkingOut ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </>
        </div>
      </div>

      {historyOpen ? (
        <div className="fixed top-0 right-0 bottom-0 left-0 md:left-[260px] bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
              <div className="text-lg font-semibold">Bill History</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshSalesOrders}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={historySearch}
                  onChange={(e) => {
                    setHistoryPage(1);
                    setHistorySearch(e.target.value);
                  }}
                  placeholder="Search customer name..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {loadingSalesOrders ? <div className="text-gray-500 mb-3">Loading...</div> : null}
              {errorSalesOrders ? <div className="text-red-600 mb-3">{errorSalesOrders}</div> : null}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Code</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Customer</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                          <th className="text-left px-4 py-3 whitespace-nowrap">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedSalesOrders.map((o) => {
                          const code = o.sales_order_code || o.order_code || `#${o.id}`;
                          const isActive = selectedSalesOrderId === o.id;
                          return (
                            <tr
                              key={o.id}
                              onClick={() => selectSalesOrder(o.id)}
                              className={[
                                "border-t cursor-pointer",
                                isActive ? "bg-orange-50" : "hover:bg-gray-50",
                              ].join(" ")}
                            >
                              <td className="px-4 py-3 whitespace-nowrap font-medium">{code}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{o.customer_name || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {formatMoney(o.total_amount ?? 0)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">{o.status || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                            </tr>
                          );
                        })}
                        {!loadingSalesOrders && salesOrders.length === 0 ? (
                          <tr className="border-t">
                            <td className="px-4 py-6 text-gray-500" colSpan={5}>
                              No bills
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      Page {effectiveHistoryPage} / {pageCount}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={effectiveHistoryPage <= 1}
                        onClick={() => setHistoryPage(effectiveHistoryPage - 1)}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={effectiveHistoryPage >= pageCount}
                        onClick={() => setHistoryPage(Math.min(pageCount, effectiveHistoryPage + 1))}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="text-sm font-semibold mb-2">Bill detail</div>
                  {loadingSalesOrderDetail ? <div className="text-gray-500">Loading...</div> : null}
                  {errorSalesOrderDetail ? <div className="text-red-600">{errorSalesOrderDetail}</div> : null}
                  {salesOrderDetail ? (
                    <>
                      <div className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">{selectedCode}</span>
                        <span className="text-gray-500">
                          {" "}
                          · {salesOrderDetail.customer_name || "-"} · {salesOrderDetail.status || "-"} ·{" "}
                          {formatMoney(salesOrderDetail.total_amount ?? 0)}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-gray-700">
                            <tr>
                              <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                              <th className="text-left px-4 py-3 whitespace-nowrap">Quantity</th>
                              <th className="text-left px-4 py-3 whitespace-nowrap">Price</th>
                              <th className="text-left px-4 py-3 whitespace-nowrap">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(salesOrderDetail.items || []).map((it, idx) => {
                              const pid = Number(it.product_id ?? 0);
                              const name = it.product_name || (pid ? `#${pid}` : `Item ${idx + 1}`);
                              const qty = toNumber(it.quantity);
                              const apiTotal = it.total_price != null ? toNumber(it.total_price) : 0;
                              const apiUnit = toNumber(it.unit_price);
                              const mapPrice = pid > 0 ? toNumber(priceByProductId[pid]) : 0;
                              const derivedFromTotal = qty > 0 && apiTotal > 0 ? apiTotal / qty : 0;
                              const price =
                                apiUnit > 0 ? apiUnit : derivedFromTotal > 0 ? derivedFromTotal : mapPrice;
                              const lineTotal = apiTotal > 0 ? apiTotal : qty * price;
                              return (
                                <tr
                                  key={it.id ?? it.order_item_id ?? `${pid}-${idx}`}
                                  className="border-t border-gray-100"
                                >
                                  <td className="px-4 py-3">{name}</td>
                                  <td className="px-4 py-3 whitespace-nowrap">{qty}</td>
                                  <td className="px-4 py-3 whitespace-nowrap">{formatMoney(price)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap font-semibold">
                                    {formatMoney(lineTotal)}
                                  </td>
                                </tr>
                              );
                            })}
                            {(salesOrderDetail.items || []).length === 0 ? (
                              <tr className="border-t border-gray-100">
                                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                                  No items
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-300">
                      <div className="text-sm text-gray-600">Bill Total</div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatMoney(billDetailTotal)}
                      </div>
                    </div>
                    </>
                  ) : (
                    <div className="text-gray-500">Select a bill to view details</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
