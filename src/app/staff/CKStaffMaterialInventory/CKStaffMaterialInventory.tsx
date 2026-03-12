import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, Search } from "lucide-react";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import materialInventoryApi, {
  type MaterialInventoryBatch,
  type MaterialInventoryRow,
} from "../../../api/materialInventoryApi";

type ErrorResponse = {
  message?: string;
};
type BatchMap = Record<number, MaterialInventoryBatch[]>;
type LoadingBatchMap = Record<number, boolean>;
type ExpandedMap = Record<number, boolean>;
const MATERIAL_INVENTORY_CACHE_KEY = "ck_material_inventory_cache";
const MATERIAL_INVENTORY_CACHE_TTL = 60 * 1000;

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

function toNumber(value: number | string | undefined): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
function formatQuantity(value: number | string | undefined): string {
  const n = toNumber(value);

  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
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
function readInventoryCache(): MaterialInventoryRow[] | null {
  try {
    const raw = sessionStorage.getItem(MATERIAL_INVENTORY_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      timestamp: number;
      data: MaterialInventoryRow[];
    };

    if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null;

    const isExpired = Date.now() - parsed.timestamp > MATERIAL_INVENTORY_CACHE_TTL;
    if (isExpired) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

function writeInventoryCache(data: MaterialInventoryRow[]): void {
  try {
    sessionStorage.setItem(
      MATERIAL_INVENTORY_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // ignore
  }
}

export default function CKStaffMaterialInventory() {
  const [rows, setRows] = useState<MaterialInventoryRow[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [refreshing, setRefreshing] = useState<boolean>(false);

const [searchTerm, setSearchTerm] = useState<string>("");
const [debouncedSearch, setDebouncedSearch] = useState<string>("");

const [expandedRows, setExpandedRows] = useState<ExpandedMap>({});
const [batchMap, setBatchMap] = useState<BatchMap>({});
const [batchLoadingMap, setBatchLoadingMap] = useState<LoadingBatchMap>({});

const loadedRef = useRef(false);
// const [initializedFromCache, setInitializedFromCache] = useState<boolean>(false);
  const loadMaterialInventory = async (
  isRefresh = false,
  showFullLoading = false
): Promise<void> => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else if (showFullLoading) {
      setLoading(true);
    }

    const res = await materialInventoryApi.getAll();
    const nextRows = Array.isArray(res.data.data) ? res.data.data : [];

    setRows(nextRows);
    writeInventoryCache(nextRows);
  } catch (error: unknown) {
    if (rows.length === 0) {
      toast.error(getErrorMessage(error, "Failed to load material inventory"));
      setRows([]);
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
  if (loadedRef.current) return;
  loadedRef.current = true;

  const cachedRows = readInventoryCache();

  if (cachedRows && cachedRows.length > 0) {
    setRows(cachedRows);
    setLoading(false);
    // setInitializedFromCache(true);
    void loadMaterialInventory(false, false);
    return;
  }

  void loadMaterialInventory(false, true);
}, []);
  useEffect(() => {
  const timer = window.setTimeout(() => {
    setDebouncedSearch(searchTerm.trim().toLowerCase());
  }, 250);

  return () => window.clearTimeout(timer);
}, [searchTerm]);
const fetchBatchesByMaterial = async (materialId: number): Promise<void> => {
  if (batchMap[materialId]) return;

  try {
    setBatchLoadingMap((prev) => ({
      ...prev,
      [materialId]: true,
    }));

    const res = await materialInventoryApi.getByMaterialId(materialId);
    const materialDetail = res.data.data;

    setBatchMap((prev) => ({
      ...prev,
      [materialId]: Array.isArray(materialDetail?.batches)
        ? materialDetail.batches
        : [],
    }));
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, "Failed to load material batches"));
    setBatchMap((prev) => ({
      ...prev,
      [materialId]: [],
    }));
  } finally {
    setBatchLoadingMap((prev) => ({
      ...prev,
      [materialId]: false,
    }));
  }
};

const handleToggleExpand = async (materialId: number): Promise<void> => {
  const nextExpanded = !expandedRows[materialId];

  setExpandedRows((prev) => ({
    ...prev,
    [materialId]: nextExpanded,
  }));

  if (nextExpanded && !batchMap[materialId]) {
    await fetchBatchesByMaterial(materialId);
  }
};

  const filteredRows = useMemo(() => {
  if (!debouncedSearch) return rows;

  return rows.filter((row) => {
    return (
  String(row.material_name || "").toLowerCase().includes(debouncedSearch) ||
  String(row.material_sku || "").toLowerCase().includes(debouncedSearch)
);
  });
}, [rows, debouncedSearch]);

  const stats = useMemo(() => {
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const row of rows) {
    const qty = toNumber(row.total_quantity);

    if (qty <= 0) {
      outOfStockCount += 1;
    } else if (qty <= 20) {
      lowStockCount += 1;
    } else {
      inStockCount += 1;
    }
  }

  return {
    totalMaterials: rows.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
  };
}, [rows]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Inventory Material</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Material inventory and batch details in the central kitchen
            </p>
          </div>

          <button
  type="button"
  onClick={() => {
    sessionStorage.removeItem(MATERIAL_INVENTORY_CACHE_KEY);
    // setInitializedFromCache(false);
    void loadMaterialInventory(true, false);
  }}
  disabled={refreshing}
  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
  {refreshing ? "Refreshing..." : "Refresh"}
</button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">Total Materials</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.totalMaterials}</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">In Stock</div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.inStockCount}</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">Low Stock</div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{stats.lowStockCount}</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-500">Out of Stock</div>
            <div className="mt-2 text-2xl font-bold text-rose-600">{stats.outOfStockCount}</div>
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
    <div className="text-base font-bold text-zinc-900">{row.material_name}</div>
    <div className="mt-1 text-sm text-zinc-500">
      SKU: {row.material_sku} · Unit: {row.unit} · Batches: {row.batch_count}
    </div>
  </div>

  <div className="flex shrink-0 items-center gap-3">
    <div className="rounded-xl bg-white px-3 py-2 text-sm text-zinc-700">
      Total: <span className="font-semibold">{formatQuantity(row.total_quantity)}</span>
    </div>

    <span
      className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ${getStockClass(
        totalQty
      )}`}
    >
      {getStockLabel(totalQty)}
    </span>

    <button
      type="button"
      onClick={() => void handleToggleExpand(row.material_id)}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
    >
      {expandedRows[row.material_id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      {expandedRows[row.material_id] ? "Hide batches" : "View batches"}
    </button>
  </div>
</div>

                  {expandedRows[row.material_id] && (
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
        {batchLoadingMap[row.material_id] ? (
          <tr>
            <td
              colSpan={5}
              className="px-4 py-6 text-center text-sm text-zinc-500"
            >
              Loading batches...
            </td>
          </tr>
        ) : (batchMap[row.material_id] || []).length === 0 ? (
          <tr>
            <td
              colSpan={5}
              className="px-4 py-6 text-center text-sm text-zinc-500"
            >
              No batches found.
            </td>
          </tr>
        ) : (
          (batchMap[row.material_id] || []).map((batch: MaterialInventoryBatch) => (
            <tr
              key={`${row.material_id}-${batch.id}-${batch.batch_id}`}
              className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50"
            >
              <td className="px-4 py-4 font-medium text-zinc-900">
                {row.material_name}
              </td>
              <td className="px-4 py-4 text-zinc-700">{formatQuantity(batch.quantity)}</td>
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
)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}