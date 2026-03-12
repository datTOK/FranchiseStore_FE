import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

import goodsReceiptMaterialApi, {
  type GoodsReceiptMaterialRow,
  type GoodsReceiptMaterialDetail,
  type GoodsReceiptMaterialItem,
} from "../../../api/goodsReceiptMaterialApi";

type ErrorResponse = {
  message?: string;
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
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export default function CKStaffGoodsReceiptMaterial() {
  const [rows, setRows] = useState<GoodsReceiptMaterialRow[]>([]);
const [rawRows, setRawRows] = useState<GoodsReceiptMaterialRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GoodsReceiptMaterialDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [completeNotes, setCompleteNotes] = useState<string>("");
  const [rejectNotes, setRejectNotes] = useState<string>("");

const buildListRows = (data: GoodsReceiptMaterialRow[]): GoodsReceiptMaterialRow[] => {
  const map = new Map<number, GoodsReceiptMaterialRow>();

  for (const row of data) {
    if (!map.has(row.id)) {
      map.set(row.id, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const buildDetailFromRows = (
  base: GoodsReceiptMaterialRow,
  allRows: GoodsReceiptMaterialRow[]
): GoodsReceiptMaterialDetail => {
  const matched = allRows.filter((row) => row.id === base.id);

  const items: GoodsReceiptMaterialItem[] = matched
    .filter((row) => row.material_batch_id || row.material_name || row.received_quantity)
    .map((row) => ({
      material_id: row.material_id,
      material_name: row.material_name,
      material_sku: row.material_sku,
      material_batch_id: row.material_batch_id,
      batch_code: row.batch_code,
      quantity: row.received_quantity ?? 0,
      unit: row.unit,
    }));

  return {
    id: base.id,
    receipt_code: base.receipt_code,
    supplier_id: base.supplier_id,
    supplier_name: base.supplier_name,
    status: base.status,
    notes: base.notes,
    created_by: base.created_by,
    created_by_name: base.created_by_name,
    confirmed_by: base.confirmed_by,
    received_by: base.received_by,
    received_by_name: base.received_by_name,
    created_at: base.created_at,
    updated_at: base.updated_at,
    completed_at: base.completed_at,
    store_name: base.store_name,
    items,
  };
};

  const loadGoodsReceiptMaterials = async (): Promise<void> => {
  try {
    setLoading(true);
    const res = await goodsReceiptMaterialApi.getAll();
    const data = res.data.data ?? [];

    setRawRows(data);
    setRows(buildListRows(data));
  } catch (error: unknown) {
    toast.error(
      getErrorMessage(error, "Failed to load Goods Receipt Materials")
    );
    setRawRows([]);
    setRows([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    void loadGoodsReceiptMaterials();
  }, []);

  const handleViewDetail = async (id: number): Promise<void> => {
  try {
    setOpenDetail(true);
    setDetailLoading(true);
    setSelectedId(id);

    const baseRow = rawRows.find((row) => row.id === id);

    if (!baseRow) {
      throw new Error("Receipt not found");
    }

    try {
      const res = await goodsReceiptMaterialApi.getById(id);
      const apiRow = res.data.data;

      const mergedBase: GoodsReceiptMaterialRow = {
        ...baseRow,
        ...apiRow,
      };

      setDetail(buildDetailFromRows(mergedBase, rawRows));
    } catch {
      setDetail(buildDetailFromRows(baseRow, rawRows));
    }
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, "Failed to load receipt details"));
    setOpenDetail(false);
    setDetail(null);
    setSelectedId(null);
  } finally {
    setDetailLoading(false);
  }
};

  const closeDetailModal = (): void => {
    setOpenDetail(false);
    setDetail(null);
    setSelectedId(null);
    setCompleteNotes("");
    setRejectNotes("");
  };

  const handleComplete = async (): Promise<void> => {
    if (!selectedId) return;

    try {
      setActionLoading(true);

      await goodsReceiptMaterialApi.complete(selectedId, {
        notes: completeNotes.trim(),
      });

      toast.success("Goods Receipt Material completed successfully");
      closeDetailModal();

      await loadGoodsReceiptMaterials();

const refreshed = await goodsReceiptMaterialApi.getAll();
const refreshedRows = refreshed.data.data ?? [];
setRawRows(refreshedRows);
setRows(buildListRows(refreshedRows));

const baseRow = refreshedRows.find((row) => row.id === selectedId);
if (baseRow) {
  setDetail(buildDetailFromRows(baseRow, refreshedRows));
}

setCompleteNotes("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to complete receipt"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (): Promise<void> => {
  if (!selectedId) return;

  try {
    setActionLoading(true);

    await goodsReceiptMaterialApi.reject(selectedId, {
      notes: rejectNotes.trim(),
    });

    await loadGoodsReceiptMaterials();

    toast.success("Goods Receipt Material rejected successfully");
    closeDetailModal();
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, "Failed to reject receipt"));
  } finally {
    setActionLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Goods Receipt Material
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Material receipt records from supplier to central kitchen
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadGoodsReceiptMaterials()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Loading data...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-10 text-center text-sm text-zinc-500">
            No Goods Receipt Material receipts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Receipt Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created By</th>
                  
                  <th className="px-4 py-3 font-medium">Created At</th>
                  <th className="px-4 py-3 font-medium text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {row.id}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {row.receipt_code || `GRM-${row.id}`}
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

                    <td className="px-4 py-3 text-zinc-700">
  {row.created_by_name || row.created_by || "-"}
</td>

                    

                    <td className="px-4 py-3 text-zinc-700">
                      {formatDate(row.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => void handleViewDetail(row.id)}
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

      {openDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Goods Receipt Material Detail
                </h2>
                <p className="text-sm text-zinc-500">
                  View details and process the material receipt
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {detailLoading || !detail ? (
                <div className="py-10 text-center text-sm text-zinc-500">
                  Loading details...
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        ID
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900">
                        {detail.id}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Receipt Code
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900">
                        {detail.receipt_code || `GRM-${detail.id}`}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Status
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            detail.status
                          )}`}
                        >
                          {detail.status}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Supplier
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900">
                        {detail.supplier_name || detail.supplier_id || "-"}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Created By
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900">
                        {detail.created_by_name || detail.created_by || "-"}
                      </div>
                    </div>

                    
                    

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Created At
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900">
                        {formatDate(detail.created_at)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Updated At
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900">
                        {formatDate(detail.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-zinc-700" />
                      <h3 className="text-lg font-semibold text-zinc-900">
                        Items
                      </h3>
                    </div>

                    {!detail.items || detail.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-500">
                        This receipt has no items.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-200 text-left text-zinc-500">
                              <th className="px-4 py-3 font-medium">
                                Material ID
                              </th>
                              <th className="px-4 py-3 font-medium">
                                Material Name
                              </th>
                              <th className="px-4 py-3 font-medium">
                                Quantity
                              </th>
                              <th className="px-4 py-3 font-medium">Unit</th>
                            </tr>
                          </thead>

                          <tbody>
                            {detail.items.map((item, index) => (
                              <tr
                                key={`${item.material_id}-${index}`}
                                className="border-b border-zinc-100"
                              >
                                <td className="px-4 py-3 text-zinc-900">
                                  {item.material_id}
                                </td>
                                <td className="px-4 py-3 text-zinc-700">
                                  {item.material_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-zinc-700">
                                  {formatQty(item.quantity)}
                                </td>
                                <td className="px-4 py-3 text-zinc-700">
                                  {item.unit || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {detail.status === "PENDING" && (
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-emerald-600" />
                          <h3 className="text-lg font-semibold text-zinc-900">
                            Complete Receipt
                          </h3>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                          Notes
                        </label>
                        <textarea
                          value={completeNotes}
                          onChange={(e) => setCompleteNotes(e.target.value)}
                          rows={4}
                          placeholder="Enter completion notes..."
                          className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />

                        <button
                          type="button"
                          onClick={() => void handleComplete()}
                          disabled={actionLoading}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 size={16} />
                          {actionLoading ? "Processing..." : "Complete"}
                        </button>
                      </div>

                      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <XCircle size={18} className="text-rose-600" />
                          <h3 className="text-lg font-semibold text-zinc-900">
                            Reject Receipt
                          </h3>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                          Notes
                        </label>
                        <textarea
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          rows={4}
                          placeholder="Enter rejection reason..."
                          className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-rose-500"
                        />

                        <button
                          type="button"
                          onClick={() => void handleReject()}
                          disabled={actionLoading}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          {actionLoading ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}