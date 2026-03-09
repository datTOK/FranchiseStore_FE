import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";
import materialInventoryApi, {
  type MaterialInventoryBatch,
  type MaterialInventoryRow,
} from "../../../api/materialInventoryApi";

type ErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

function toNumber(value: number | string | undefined): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB");
}

function getStockLabel(quantity: number): "In stock" | "Low stock" | "Out of stock" {
  if (quantity <= 0) return "Out of stock";
  if (quantity <= 20) return "Low stock";
  return "In stock";
}

function getStockClass(quantity: number): string {
  if (quantity <= 0) return "bg-rose-100 text-rose-700";
  if (quantity <= 20) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function CKStaffMaterialInventory() {
  const [rows, setRows] = useState<MaterialInventoryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadMaterialInventory = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await materialInventoryApi.getAll();
      setRows(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load material inventory"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMaterialInventory();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) => {
      return (
        row.material_name.toLowerCase().includes(keyword) ||
        row.material_sku.toLowerCase().includes(keyword)
      );
    });
  }, [rows, searchTerm]);

  const totalMaterials = rows.length;
  const inStockCount = rows.filter((row) => toNumber(row.total_quantity) > 20).length;
  const lowStockCount = rows.filter((row) => {
    const qty = toNumber(row.total_quantity);
    return qty > 0 && qty <= 20;
  }).length;
  const outOfStockCount = rows.filter((row) => toNumber(row.total_quantity) <= 0).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Material Inventory</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Material inventory and batch details in the central kitchen
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadMaterialInventory()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">Total Materials</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{totalMaterials}</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">In Stock</div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{inStockCount}</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">Low Stock</div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">Out of Stock</div>
            <div className="mt-2 text-2xl font-bold text-rose-600">{outOfStockCount}</div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search material name or SKU..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-zinc-500">Loading data...</div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-10 text-center text-sm text-zinc-500">
            No material inventory data found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRows.map((row) => {
              const totalQty = toNumber(row.total_quantity);

              return (
                <div
                  key={row.material_id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-4">
                    <div className="min-w-0">
                      <div className="text-base font-bold text-zinc-900">
                        {row.material_name}
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">
                        SKU: {row.material_sku} · Unit: {row.unit}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="rounded-xl bg-white px-3 py-2 text-sm text-zinc-700">
                        Total: <span className="font-semibold">{row.total_quantity}</span>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ${getStockClass(
                          totalQty
                        )}`}
                      >
                        {getStockLabel(totalQty)}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed text-sm">
                      <colgroup>
                        <col className="w-[32%]" />
                        <col className="w-[14%]" />
                        <col className="w-[14%]" />
                        <col className="w-[22%]" />
                        <col className="w-[18%]" />
                      </colgroup>

                      <thead>
                        <tr className="border-b border-zinc-200 bg-white text-left text-zinc-500">
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Quantity</th>
                          <th className="px-4 py-3 font-medium">Unit</th>
                          <th className="px-4 py-3 font-medium">Supplier</th>
                          <th className="px-4 py-3 font-medium">Received Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {row.batches.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-zinc-500"
                            >
                              No batches found.
                            </td>
                          </tr>
                        ) : (
                          row.batches.map((batch: MaterialInventoryBatch) => (
                            <tr
                              key={`${row.material_id}-${batch.id}-${batch.batch_id}`}
                              className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50"
                            >
                              <td className="px-4 py-4 font-medium text-zinc-900">
                                {row.material_name}
                              </td>
                              <td className="px-4 py-4 text-zinc-700">
                                {batch.quantity}
                              </td>
                              <td className="px-4 py-4 text-zinc-700">
                                {batch.unit || row.unit}
                              </td>
                              <td className="px-4 py-4 text-zinc-700">
                                {batch.supplier_name || "-"}
                              </td>
                              <td className="px-4 py-4 text-zinc-700">
                                {formatDate(batch.received_date)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}