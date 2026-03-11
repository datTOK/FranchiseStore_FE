import { Plus, Trash2 } from "lucide-react";
import type { InventoryItemApi } from "../api/inventoryApi";

type CartRow = {
  product_id: number;
  name: string;
  sku: string;
  uom: string;
  price: number;
  quantity: number;
};

type Props = {
  inventory: InventoryItemApi[];
  filteredInventory: InventoryItemApi[];
  loadingInv: boolean;
  errorInv: string;
  search: string;
  setSearch: (v: string) => void;
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

export default function FRStaffPOS(props: Props) {
  const {
    filteredInventory,
    loadingInv,
    errorInv,
    search,
    setSearch,
    cart,
    addToCart,
    removeFromCart,
    setCartRow,
    total,
    checkingOut,
    checkout,
  } = props;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Point of Sale</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Inventory</div>
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
                  <th className="text-left px-4 py-3 whitespace-nowrap">Qty</th>
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
          <div className="text-lg font-semibold mb-4">Bill</div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Qty</th>
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
                        <div className="text-xs text-gray-500">#{r.product_id} · {r.sku}</div>
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
                        <input
                          type="number"
                          min={0}
                          value={r.price}
                          onChange={(e) =>
                            setCartRow(r.product_id, {
                              price: e.target.value === "" ? 0 : Number(e.target.value),
                            })
                          }
                          className="w-[120px] px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
                        />
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
        </div>
      </div>
    </div>
  );
}
