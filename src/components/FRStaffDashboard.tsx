import { useMemo } from "react";

export type Metric = {
  range: {
    purchaseValue: number;
    salesValue: number;
    profit: number;
  };
  today: {
    purchaseValue: number;
    salesValue: number;
    profit: number;
  };
  month: {
    purchaseValue: number;
    salesValue: number;
    profit: number;
  };
  year: {
    purchaseValue: number;
    salesValue: number;
    profit: number;
  };
};

export type StatRow = {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Props = {
  loading: boolean;
  error: string;
  subtitle: string;
  onRefresh: () => void;

  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  onApplyDate: () => void;

  metric: Metric;
  purchases: StatRow[];
  sales: StatRow[];
};

function formatMoneyVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function StatTable(props: { title: string; rows: StatRow[] }) {
  const { title, rows } = props;
  const total = useMemo(() => rows.reduce((sum, r) => sum + (Number.isFinite(r.total) ? r.total : 0), 0), [rows]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-orange-600">{formatMoneyVnd(total)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3 whitespace-nowrap">Product</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">SKU</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">Quantity</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">Unit Price</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.product_id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{r.sku || "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">{r.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">{formatMoneyVnd(r.unit_price)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                  {formatMoneyVnd(r.total)}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr className="border-t border-gray-100">
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  No data
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryRow(props: {
  label: string;
  purchaseValue: number;
  salesValue: number;
  profit: number;
}) {
  const { label, purchaseValue, salesValue, profit } = props;
  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3 font-medium whitespace-nowrap">{label}</td>
      <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoneyVnd(purchaseValue)}</td>
      <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoneyVnd(salesValue)}</td>
      <td className="px-4 py-3 text-right whitespace-nowrap font-semibold">{formatMoneyVnd(profit)}</td>
    </tr>
  );
}

export default function FRStaffDashboard(props: Props) {
  const {
    loading,
    error,
    subtitle,
    onRefresh,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    onApplyDate,
    metric,
    purchases,
    sales,
  } = props;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="text-lg font-semibold mb-3">Summary (Today / Month / Year)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap">Period</th>
                <th className="text-right px-4 py-3 whitespace-nowrap">Purchases</th>
                <th className="text-right px-4 py-3 whitespace-nowrap">Sales</th>
                <th className="text-right px-4 py-3 whitespace-nowrap">Profit</th>
              </tr>
            </thead>
            <tbody>
              <SummaryRow
                label="Today"
                purchaseValue={metric.today.purchaseValue}
                salesValue={metric.today.salesValue}
                profit={metric.today.profit}
              />
              <SummaryRow
                label="This Month"
                purchaseValue={metric.month.purchaseValue}
                salesValue={metric.month.salesValue}
                profit={metric.month.profit}
              />
              <SummaryRow
                label="This Year"
                purchaseValue={metric.year.purchaseValue}
                salesValue={metric.year.salesValue}
                profit={metric.year.profit}
              />
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <div className="text-lg font-semibold mb-1">Date Filter</div>
            <div className="text-sm text-gray-500">Filter purchase and sales statistics by date</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">From</div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">To</div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={onApplyDate}
              className="h-[42px] self-end px-5 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatTable title="Purchases (Goods Receipts)" rows={purchases} />
        <StatTable title="Sales (Sales Orders)" rows={sales} />
      </div>
    </div>
  );
}
