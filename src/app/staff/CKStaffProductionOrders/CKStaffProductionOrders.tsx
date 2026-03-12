import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  Eye,
  Play,
  CheckCircle2,
  Ban,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

import productionOrderApi, {
  type CreateProductionOrderPayload,
  type ProductionOrderDetail,
  type ProductionOrderRow,
} from "../../../api/productionOrderApi";
import productRecipeApi, {
  type ProductRecipeRow,
} from "../../../api/productRecipeApi";

type ErrorResponse = {
  message?: string;
};

type CreateFormState = {
  recipe_id: string;
  target_quantity: string;
  target_date: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}
function formatQty(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "-";

  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);

  return Number.isInteger(num) ? String(num) : String(num);
}

function getStatusClass(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-700";
    case "IN_PROGRESS":
      return "bg-violet-100 text-violet-700";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function normalizeProductionOrderDetail(
  raw: unknown,
  fallbackRow: ProductionOrderRow
): ProductionOrderDetail {
  const root =
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as { data?: unknown }).data &&
    typeof (raw as { data?: unknown }).data === "object"
      ? ((raw as { data?: unknown }).data as Record<string, unknown>)
      : ((raw as Record<string, unknown>) ?? {});

  const nestedOrder =
    root.order && typeof root.order === "object"
      ? (root.order as Partial<ProductionOrderDetail>)
      : root.orders && typeof root.orders === "object"
      ? (root.orders as Partial<ProductionOrderDetail>)
      : null;

  const source: Partial<ProductionOrderDetail> =
    nestedOrder ?? (root as Partial<ProductionOrderDetail>);

  const materialsSource =
    Array.isArray(source.materials)
      ? source.materials
      : Array.isArray(
          (root as { materials?: unknown }).materials
        )
      ? ((root as { materials?: ProductionOrderDetail["materials"] }).materials ?? [])
      : [];

  return {
    ...fallbackRow,
    ...source,
    status: source.status || fallbackRow.status,
    order_code: source.order_code || fallbackRow.order_code,
    recipe_name: source.recipe_name || fallbackRow.recipe_name,
    product_name: source.product_name || fallbackRow.product_name,
    target_quantity: source.target_quantity ?? fallbackRow.target_quantity,
    target_unit: source.target_unit || fallbackRow.target_unit,
    actual_quantity: source.actual_quantity ?? fallbackRow.actual_quantity,
    target_date: source.target_date || fallbackRow.target_date,
    materials: materialsSource,
  };
}

export default function CKStaffProductionOrders() {
  const [rows, setRows] = useState<ProductionOrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [recipes, setRecipes] = useState<ProductRecipeRow[]>([]);
  const [recipesLoading, setRecipesLoading] = useState<boolean>(false);

  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [form, setForm] = useState<CreateFormState>({
    recipe_id: "",
    target_quantity: "1",
    target_date: "",
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<ProductionOrderRow | null>(null);
  const [detail, setDetail] = useState<ProductionOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [startNotes, setStartNotes] = useState<string>("");
  const [completeQuantity, setCompleteQuantity] = useState<string>("1");
  const [cancelNotes, setCancelNotes] = useState<string>("");

  const loadProductionOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await productionOrderApi.getAll();
      setRows(res.data.data ?? []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load Production Orders"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async (): Promise<void> => {
    try {
      setRecipesLoading(true);
      const res = await productRecipeApi.getActive();
      setRecipes(res.data.data ?? []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load Product Recipes"));
      setRecipes([]);
    } finally {
      setRecipesLoading(false);
    }
  };

  useEffect(() => {
    void loadProductionOrders();
    void loadRecipes();
  }, []);

  const recipeOptions = useMemo(() => {
    return recipes.map((recipe) => ({
      id: recipe.id,
      label: recipe.product_name || recipe.name || `Recipe #${recipe.id}`,
    }));
  }, [recipes]);

  const currentStatus = detail?.status || selectedRow?.status || "";
  const canStart = currentStatus === "PENDING" || currentStatus === "CONFIRMED";
  const canComplete = currentStatus === "IN_PROGRESS";
  const canCancel =
    currentStatus === "PENDING" ||
    currentStatus === "CONFIRMED" ||
    currentStatus === "IN_PROGRESS";

  const handleChangeForm = (key: keyof CreateFormState, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeCreateModal = (): void => {
    setOpenCreateModal(false);
    setForm({
      recipe_id: "",
      target_quantity: "1",
      target_date: "",
    });
  };

  const handleCreate = async (): Promise<void> => {
    const recipeId = Number(form.recipe_id);
    const targetQuantity = Number(form.target_quantity);

    if (!Number.isFinite(recipeId) || recipeId < 1) {
      toast.error("Please select a product");
      return;
    }

    if (!Number.isFinite(targetQuantity) || targetQuantity < 1) {
      toast.error("Target quantity must be at least 1");
      return;
    }

    if (!form.target_date.trim()) {
      toast.error("Target date is required");
      return;
    }

    const payload: CreateProductionOrderPayload = {
      recipe_id: recipeId,
      target_quantity: targetQuantity,
      target_unit: "PC",
      target_date: form.target_date,
    };

    try {
      setCreateLoading(true);
      await productionOrderApi.create(payload);
      toast.success("Production Order created successfully");
      closeCreateModal();
      await loadProductionOrders();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to create Production Order"));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewDetail = async (row: ProductionOrderRow): Promise<void> => {
    try {
      setOpenDetail(true);
      setDetailLoading(true);
      setSelectedId(row.id);
      setSelectedRow(row);
      setDetail(null);
      setStartNotes("");
      setCancelNotes("");
      setCompleteQuantity(
        String(
          Number(row.actual_quantity ?? row.target_quantity ?? 1) >= 1
            ? Math.floor(Number(row.actual_quantity ?? row.target_quantity ?? 1))
            : 1
        )
      );

      const res = await productionOrderApi.getById(row.id);
console.log("production order detail response =", res);
console.log("production order detail response.data =", res.data);

const normalizedDetail = normalizeProductionOrderDetail(res.data, row);
console.log("normalized detail =", normalizedDetail);
console.log("normalized materials =", normalizedDetail.materials);

setDetail(normalizedDetail);

const quantitySource =
  normalizedDetail.actual_quantity ??
  normalizedDetail.target_quantity ??
  row.target_quantity ??
  1;

      setCompleteQuantity(
        String(Number(quantitySource) >= 1 ? Math.floor(Number(quantitySource)) : 1)
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load production order details"));
      setOpenDetail(false);
      setDetail(null);
      setSelectedId(null);
      setSelectedRow(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = (): void => {
    setOpenDetail(false);
    setDetail(null);
    setSelectedId(null);
    setSelectedRow(null);
    setStartNotes("");
    setCompleteQuantity("1");
    setCancelNotes("");
  };

  const reloadSelectedDetail = async (): Promise<void> => {
    if (!selectedId || !selectedRow) return;

    const res = await productionOrderApi.getById(selectedId);
const normalizedDetail = normalizeProductionOrderDetail(res.data, selectedRow);
setDetail(normalizedDetail);
  };

  const handleStart = async (): Promise<void> => {
    if (!selectedId) return;

    if (!canStart) {
      toast.error("Only pending or confirmed orders can be started");
      return;
    }

    try {
      setActionLoading(true);
      await productionOrderApi.start(selectedId, { notes: startNotes.trim() });
      toast.success("Production Order started successfully");
      await loadProductionOrders();

      const updatedRows = await productionOrderApi.getAll();
      const nextRow =
        updatedRows.data.data.find((item) => item.id === selectedId) || selectedRow;

      if (nextRow) {
        setSelectedRow(nextRow);
      }

      await reloadSelectedDetail();
      setStartNotes("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to start Production Order"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (): Promise<void> => {
    if (!selectedId) return;

    if (!canComplete) {
      toast.error("Only in-progress orders can be completed");
      return;
    }

    const actualQuantity = Number(completeQuantity);

    if (!Number.isFinite(actualQuantity) || actualQuantity < 1) {
      toast.error("Actual quantity must be at least 1");
      return;
    }

    try {
      setActionLoading(true);
      await productionOrderApi.complete(selectedId, {
        actual_quantity: actualQuantity,
      });
      toast.success("Production Order completed successfully");
      await loadProductionOrders();

      const updatedRows = await productionOrderApi.getAll();
      const nextRow =
        updatedRows.data.data.find((item) => item.id === selectedId) || selectedRow;

      if (nextRow) {
        setSelectedRow(nextRow);
      }

      await reloadSelectedDetail();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to complete Production Order"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    if (!selectedId) return;

    if (!canCancel) {
      toast.error("This order can no longer be cancelled");
      return;
    }

    try {
      setActionLoading(true);
      await productionOrderApi.cancel(selectedId, { notes: cancelNotes.trim() });
      toast.success("Production Order cancelled successfully");
      await loadProductionOrders();

      const updatedRows = await productionOrderApi.getAll();
      const nextRow =
        updatedRows.data.data.find((item) => item.id === selectedId) || selectedRow;

      if (nextRow) {
        setSelectedRow(nextRow);
      }

      await reloadSelectedDetail();
      setCancelNotes("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to cancel Production Order"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Production Orders</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Create and manage production orders from recipes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <Plus size={16} />
              Create
            </button>

            <button
              type="button"
              onClick={() => {
                void loadProductionOrders();
                void loadRecipes();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Loading production orders...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-10 text-center text-sm text-zinc-500">
            No production orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Order Code</th>
                  
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Target Qty</th>
                  <th className="px-4 py-3 font-medium">Actual Qty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Target Date</th>
                  <th className="px-4 py-3 font-medium text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{row.id}</td>
                    <td className="px-4 py-3 text-zinc-700">{row.order_code}</td>
                    
                    <td className="px-4 py-3 text-zinc-700">
                      {row.product_name || `Product ${row.product_id}`}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
  {formatQty(row.target_quantity)}
</td>
                    <td className="px-4 py-3 text-zinc-700">
  {row.actual_quantity != null ? formatQty(row.actual_quantity) : "-"}
</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{formatDate(row.target_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => void handleViewDetail(row)}
                          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openCreateModal && (
        <div className="fixed inset-y-0 left-0 right-0 z-50 bg-black/40 p-3 md:left-[260px] sm:p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
                    Create Production Order
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Create a new production order from recipe
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="shrink-0 rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Product
                  </label>
                  <select
                    value={form.recipe_id}
                    onChange={(e) => handleChangeForm("recipe_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                    disabled={recipesLoading}
                  >
                    <option value="">
                      {recipesLoading ? "Loading products..." : "Select product"}
                    </option>
                    {recipeOptions.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Target Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.target_quantity}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        handleChangeForm("target_quantity", "");
                        return;
                      }

                      const num = Number(value);
                      if (Number.isFinite(num) && num >= 1) {
                        handleChangeForm("target_quantity", String(Math.floor(num)));
                      }
                    }}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                    placeholder="Enter target quantity"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => handleChangeForm("target_date", e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={createLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={16} />
                  {createLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openDetail && (
  <div className="fixed inset-y-0 left-0 right-0 z-50 bg-black/40 p-3 sm:left-[260px] sm:p-4">
    <div className="flex min-h-full items-center justify-center">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
                    Production Order Detail
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    View details and manage the production order
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="shrink-0 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-4 sm:p-6">
                {detailLoading ? (
                  <div className="py-10 text-center text-sm text-zinc-500">
                    Loading production order details...
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          currentStatus
                        )}`}
                      >
                        {currentStatus || "UNKNOWN"}
                      </span>

                      <span className="text-sm text-zinc-500">
                        {selectedRow?.product_name || detail?.product_name || "-"}
                      </span>
                    </div>

                    {(canStart || canComplete) && (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {canStart && (
                          <div className="rounded-2xl border border-zinc-200 p-4">
                            <div className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
                              <Play size={18} />
                              Start Production
                            </div>

                            <textarea
                              value={startNotes}
                              onChange={(e) => setStartNotes(e.target.value)}
                              rows={4}
                              className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                              placeholder="Enter notes if needed"
                            />

                            <button
                              type="button"
                              onClick={() => void handleStart()}
                              disabled={actionLoading}
                              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Play size={16} />
                              Start
                            </button>
                          </div>
                        )}

                        {canComplete && (
                          <div className="rounded-2xl border border-zinc-200 p-4">
                            <div className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
                              <CheckCircle2 size={18} />
                              Complete Production
                            </div>

                            <div className="mb-3">
                              <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Actual Quantity
                              </label>
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={completeQuantity}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (value === "") {
                                    setCompleteQuantity("");
                                    return;
                                  }

                                  const num = Number(value);
                                  if (Number.isFinite(num) && num >= 1) {
                                    setCompleteQuantity(String(Math.floor(num)));
                                  }
                                }}
                                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                                placeholder="Enter actual quantity"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => void handleComplete()}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCircle2 size={16} />
                              Complete
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {canCancel && (
                      <div className="rounded-2xl border border-zinc-200 p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
                          <Ban size={18} />
                          Cancel Production
                        </div>

                        <textarea
                          value={cancelNotes}
                          onChange={(e) => setCancelNotes(e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400"
                          placeholder="Enter reason for cancellation"
                        />

                        <button
                          type="button"
                          onClick={() => void handleCancel()}
                          disabled={actionLoading}
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Ban size={16} />
                          Cancel
                        </button>
                      </div>
                    )}

                    

                    <div className="rounded-2xl border border-zinc-200 p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-zinc-900">Materials</h3>
                      </div>

                      {!detail?.materials || detail.materials.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-500">
                          No materials found.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-[650px] w-full text-sm">
                            <thead>
                              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                                <th className="px-4 py-3 font-medium">Material ID</th>
                                <th className="px-4 py-3 font-medium">Material Name</th>
                                <th className="px-4 py-3 font-medium">Required Qty</th>
<th className="px-4 py-3 font-medium">Required Unit</th>
<th className="px-4 py-3 font-medium">Allocated Qty</th>
<th className="px-4 py-3 font-medium">Allocated Unit</th>
<th className="px-4 py-3 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.materials.map((item, index) => (
                                <tr
                                  key={`${item.material_id ?? "material"}-${index}`}
                                  className="border-b border-zinc-100"
                                >
                                  <td className="px-4 py-3 text-zinc-700">
                                    {item.material_id ?? "-"}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-700">
                                    {item.material_name ?? "-"}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-700">
  {item.required_quantity != null ? formatQty(item.required_quantity) : "-"}
</td>
<td className="px-4 py-3 text-zinc-700">
  {item.required_unit ?? "-"}
</td>
<td className="px-4 py-3 text-zinc-700">
  {item.allocated_quantity != null ? formatQty(item.allocated_quantity) : "-"}
</td>
<td className="px-4 py-3 text-zinc-700">
  {item.allocated_unit ?? "-"}
</td>
<td className="px-4 py-3 text-zinc-700">
  {item.status ?? "-"}
</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}