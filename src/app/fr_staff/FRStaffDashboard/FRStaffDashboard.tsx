import { useCallback, useEffect, useMemo, useState } from "react";
import FRStaffDashboardView, { type Metric, type StatRow } from "../../../components/FRStaffDashboard";
import { productApi } from "../../../api/product.api";
import storePricingApi, { type StorePricingRow } from "../../../api/storePricingApi";
import axiosClient from "../../../api/axiosClient";
import goodsReceiptApi, { type GoodsReceiptDetail, type GoodsReceiptRow } from "../../../api/goodsReceiptApi";

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

type ErrorWithResponseMessage = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getErrorMessage(e: unknown, fallback: string) {
  const err = e as ErrorWithResponseMessage;
  return err?.response?.data?.message || err?.message || fallback;
}

function toNumber(v: string | number | undefined | null) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function toDateInput(d: Date) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfToday(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfToday(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function inRange(t: Date | null, from: Date, to: Date) {
  return !!t && !Number.isNaN(t.getTime()) && t >= from && t <= to;
}

export default function FRStaffDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState(() => toDateInput(new Date()));
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInput(d);
  });

  const [metric, setMetric] = useState<Metric>({
    range: { purchaseValue: 0, salesValue: 0, profit: 0 },
    today: { purchaseValue: 0, salesValue: 0, profit: 0 },
    month: { purchaseValue: 0, salesValue: 0, profit: 0 },
    year: { purchaseValue: 0, salesValue: 0, profit: 0 },
  });

  const [purchases, setPurchases] = useState<StatRow[]>([]);
  const [sales, setSales] = useState<StatRow[]>([]);

  const subtitle = useMemo(() => {
    if (!lastUpdatedAt) return "Not updated yet";
    return `Last updated: ${lastUpdatedAt.toLocaleString("en-US")}`;
  }, [lastUpdatedAt]);

  const parseStart = (s: string) => new Date(`${s}T00:00:00`);
  const parseEnd = (s: string) => new Date(`${s}T23:59:59.999`);

  const loadDashboard = useCallback(async (rangeFrom: string, rangeTo: string) => {
    setLoading(true);
    setError("");

    const from = parseStart(rangeFrom);
    const to = parseEnd(rangeTo);
    const now = new Date();
    const todayFrom = startOfToday(now);
    const todayTo = endOfToday(now);
    const monthFrom = startOfMonth(now);
    const yearFrom = startOfYear(now);
    try {
      const [
        pricingRes,
        productRes,
        receiptsRes,
        salesOrdersRes,
      ] = await Promise.all([
        storePricingApi.getAll(),
        productApi.getAll(),
        goodsReceiptApi.getAll(),
        axiosClient.get("/sales-orders", {
          params: {
            sort_by: "created_at",
            sort_order: "DESC",
            fromDate: rangeFrom,
            toDate: rangeTo,
          },
        }),
      ]);

      const pricings: StorePricingRow[] = Array.isArray(pricingRes?.data?.data)
        ? pricingRes.data.data
        : [];
      const products = Array.isArray(productRes?.data?.data) ? productRes.data.data : [];

      const productInfoById = new Map<number, { name: string; sku: string }>();
      for (const p of products) {
        const id = toNumber(p.id);
        if (id <= 0) continue;
        productInfoById.set(id, { name: String(p.name || `#${id}`), sku: String(p.sku || "") });
      }

      const unitPriceByProductId = new Map<number, number>();
      for (const p of products) {
        const id = toNumber(p.id);
        const unitPrice = toNumber(p.unit_price);
        if (id > 0 && unitPrice > 0) unitPriceByProductId.set(id, unitPrice);
      }

      const salePriceByProductId = new Map<number, number>();
      for (const r of pricings) {
        const id = toNumber(r.product_id);
        const sale = toNumber(r.sale_price);
        if (id > 0 && sale > 0) salePriceByProductId.set(id, sale);
      }

      const receiptsBody = receiptsRes?.data as { data?: unknown };
      const receipts: GoodsReceiptRow[] = Array.isArray(receiptsBody?.data)
        ? (receiptsBody.data as GoodsReceiptRow[])
        : [];

      const receiptsInYear = receipts.filter((r) => {
        const t = r.created_at ? new Date(r.created_at) : null;
        return inRange(t, yearFrom, todayTo);
      });
      const receiptDetailsYear = await Promise.all(
        receiptsInYear.map(async (r) => {
          const res = await goodsReceiptApi.getById(r.id);
          const detail = (res?.data?.data ?? null) as unknown;
          if (detail && typeof detail === "object") return detail as GoodsReceiptDetail;
          return { ...r, items: [] };
        }),
      );

      const purchaseAggRange = new Map<number, { quantity: number }>();
      const purchaseAggToday = new Map<number, { quantity: number }>();
      const purchaseAggMonth = new Map<number, { quantity: number }>();
      const purchaseAggYear = new Map<number, { quantity: number }>();

      const sumInto = (agg: Map<number, { quantity: number }>, d: GoodsReceiptDetail) => {
        for (const it of d.items || []) {
          const pid = toNumber(it.product_id);
          const qty = toNumber(it.quantity);
          if (pid <= 0 || qty <= 0) continue;
          const cur = agg.get(pid) ?? { quantity: 0 };
          cur.quantity += qty;
          agg.set(pid, cur);
        }
      };

      for (const d of receiptDetailsYear) {
        const createdAt = d.created_at ? new Date(d.created_at) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) continue;
        if (inRange(createdAt, from, to)) sumInto(purchaseAggRange, d);
        if (inRange(createdAt, todayFrom, todayTo)) sumInto(purchaseAggToday, d);
        if (inRange(createdAt, monthFrom, todayTo)) sumInto(purchaseAggMonth, d);
        if (inRange(createdAt, yearFrom, todayTo)) sumInto(purchaseAggYear, d);
      }

      const buildRows = (agg: Map<number, { quantity: number }>) => {
        const rows: StatRow[] = Array.from(agg.entries()).map(([pid, v]) => {
          const info = productInfoById.get(pid) ?? { name: `#${pid}`, sku: "" };
          const unit = unitPriceByProductId.get(pid) ?? 0;
          return {
            product_id: pid,
            name: info.name,
            sku: info.sku,
            quantity: v.quantity,
            unit_price: unit,
            total: v.quantity * unit,
          };
        });
        rows.sort((a, b) => b.total - a.total);
        return rows;
      };

      const purchaseRowsRange = buildRows(purchaseAggRange);
      const purchaseValueRange = purchaseRowsRange.reduce((sum, r) => sum + toNumber(r.total), 0);
      const purchaseValueToday = buildRows(purchaseAggToday).reduce((sum, r) => sum + toNumber(r.total), 0);
      const purchaseValueMonth = buildRows(purchaseAggMonth).reduce((sum, r) => sum + toNumber(r.total), 0);
      const purchaseValueYear = buildRows(purchaseAggYear).reduce((sum, r) => sum + toNumber(r.total), 0);

      const salesOrdersBody = salesOrdersRes?.data as { data?: unknown };
      const salesOrders: SalesOrderListRow[] = Array.isArray(salesOrdersBody?.data)
        ? (salesOrdersBody.data as SalesOrderListRow[])
        : [];

      const salesOrdersToday = salesOrders.filter((o) => {
        const t = o.created_at ? new Date(o.created_at) : null;
        return inRange(t, todayFrom, todayTo);
      });
      const salesOrdersMonth = salesOrders.filter((o) => {
        const t = o.created_at ? new Date(o.created_at) : null;
        return inRange(t, monthFrom, todayTo);
      });
      const salesOrdersYear = salesOrders.filter((o) => {
        const t = o.created_at ? new Date(o.created_at) : null;
        return inRange(t, yearFrom, todayTo);
      });
      const salesOrdersInRange = salesOrders.filter((o) => {
        const t = o.created_at ? new Date(o.created_at) : null;
        return inRange(t, from, to);
      });

      const detailList = await Promise.all(
        salesOrdersInRange.map(async (o) => {
          try {
            const res = await axiosClient.get(`/sales-orders/${o.id}`);
            const body = res?.data as { data?: unknown };
            const detail =
              body?.data && typeof body.data === "object"
                ? (body.data as SalesOrderDetail)
                : (res?.data as SalesOrderDetail);
            return detail;
          } catch {
            return null;
          }
        }),
      );

      const orderTotalById = new Map<number, number>();
      for (const d of detailList) {
        if (!d) continue;
        const declared = toNumber(d.total_amount);
        if (declared > 0) {
          orderTotalById.set(d.id, declared);
          continue;
        }
        const sum = (d.items || []).reduce((acc, it) => {
          const qty = toNumber(it.quantity);
          const apiTotal = it.total_price != null ? toNumber(it.total_price) : 0;
          const apiUnit = toNumber(it.unit_price);
          const pid = toNumber(it.product_id);
          const fallbackUnit = pid > 0 ? toNumber(salePriceByProductId.get(pid)) : 0;
          const unit = apiUnit > 0 ? apiUnit : fallbackUnit;
          const lineTotal = apiTotal > 0 ? apiTotal : qty * unit;
          return acc + lineTotal;
        }, 0);
        orderTotalById.set(d.id, sum);
      }

      const sumOrderTotals = (orders: SalesOrderListRow[]) =>
        orders.reduce((sum, o) => {
          const declared = toNumber(o.total_amount);
          if (declared > 0) return sum + declared;
          const computed = orderTotalById.get(o.id) ?? 0;
          return sum + computed;
        }, 0);

      const salesValueRange = sumOrderTotals(salesOrdersInRange);
      const salesValueToday = sumOrderTotals(salesOrdersToday);
      const salesValueMonth = sumOrderTotals(salesOrdersMonth);
      const salesValueYear = sumOrderTotals(salesOrdersYear);

      const profitRange = salesValueRange - purchaseValueRange;
      const profitToday = salesValueToday - purchaseValueToday;
      const profitMonth = salesValueMonth - purchaseValueMonth;
      const profitYear = salesValueYear - purchaseValueYear;

      const saleAgg = new Map<number, { quantity: number; total: number; name: string }>();
      for (const d of detailList) {
        if (!d) continue;
        for (const it of d.items || []) {
          const pid = toNumber(it.product_id);
          const qty = toNumber(it.quantity);
          if (pid <= 0 || qty <= 0) continue;

          const apiTotal = it.total_price != null ? toNumber(it.total_price) : 0;
          const apiUnit = toNumber(it.unit_price);
          const fallbackUnit = salePriceByProductId.get(pid) ?? 0;
          const unit = apiUnit > 0 ? apiUnit : fallbackUnit;
          const lineTotal = apiTotal > 0 ? apiTotal : qty * unit;

          const cur = saleAgg.get(pid) ?? { quantity: 0, total: 0, name: it.product_name || "" };
          cur.quantity += qty;
          cur.total += lineTotal;
          if (!cur.name) cur.name = it.product_name || "";
          saleAgg.set(pid, cur);
        }
      }

      const saleRows: StatRow[] = Array.from(saleAgg.entries())
        .map(([pid, v]) => {
          const info = productInfoById.get(pid) ?? { name: v.name || `#${pid}`, sku: "" };
          const unit = v.quantity > 0 ? v.total / v.quantity : 0;
          return {
            product_id: pid,
            name: info.name,
            sku: info.sku,
            quantity: v.quantity,
            unit_price: unit,
            total: v.total,
          };
        })
        .sort((a, b) => b.total - a.total);

      setMetric({
        range: { purchaseValue: purchaseValueRange, salesValue: salesValueRange, profit: profitRange },
        today: { purchaseValue: purchaseValueToday, salesValue: salesValueToday, profit: profitToday },
        month: { purchaseValue: purchaseValueMonth, salesValue: salesValueMonth, profit: profitMonth },
        year: { purchaseValue: purchaseValueYear, salesValue: salesValueYear, profit: profitYear },
      });

      setPurchases(purchaseRowsRange);
      setSales(saleRows);
      setLastUpdatedAt(new Date());
      return;
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load dashboard"));
      setMetric({
        range: { purchaseValue: 0, salesValue: 0, profit: 0 },
        today: { purchaseValue: 0, salesValue: 0, profit: 0 },
        month: { purchaseValue: 0, salesValue: 0, profit: 0 },
        year: { purchaseValue: 0, salesValue: 0, profit: 0 },
      });
      setPurchases([]);
      setSales([]);
      setLastUpdatedAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(dateFrom, dateTo);
  }, [dateFrom, dateTo, loadDashboard]);



  return (
    <FRStaffDashboardView
      loading={loading}
      error={error}
      subtitle={subtitle}
      onRefresh={() => void loadDashboard(dateFrom, dateTo)}
      dateFrom={dateFrom}
      dateTo={dateTo}
      setDateFrom={setDateFrom}
      setDateTo={setDateTo}
      onApplyDate={() => void loadDashboard(dateFrom, dateTo)}
      metric={metric}
      purchases={purchases}
      sales={sales}
    />
  );
}
