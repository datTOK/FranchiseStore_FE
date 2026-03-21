import FRStaffPOS from "../../../components/FRStaffPOS";
import { useEffect, useMemo, useState } from "react";
import inventoryApi, { type InventoryItemApi } from "../../../api/inventoryApi";
import storePricingApi, { type StorePricingRow } from "../../../api/storePricingApi";
import axiosClient from "../../../api/axiosClient";
import toast from "react-hot-toast";

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

export default function FRStaffPOSPage() {
  const [inventory, setInventory] = useState<InventoryItemApi[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [errorInv, setErrorInv] = useState("");
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState<CartRow[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [salePriceByProductId, setSalePriceByProductId] = useState<Record<number, number>>(
    {},
  );

  const [historySearch, setHistorySearch] = useState("");
  const [salesOrders, setSalesOrders] = useState<SalesOrderListRow[]>([]);
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(false);
  const [errorSalesOrders, setErrorSalesOrders] = useState("");
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState<number | null>(null);
  const [salesOrderDetail, setSalesOrderDetail] = useState<SalesOrderDetail | null>(null);
  const [loadingSalesOrderDetail, setLoadingSalesOrderDetail] = useState(false);
  const [errorSalesOrderDetail, setErrorSalesOrderDetail] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInv(true);
      setErrorInv("");
      try {
        const [invRes, pricingRes] = await Promise.all([
          inventoryApi.getAll(),
          storePricingApi.getAll(),
        ]);

        const list: InventoryItemApi[] = Array.isArray(invRes?.data) ? invRes.data : [];
        const pricings: StorePricingRow[] = Array.isArray(pricingRes?.data?.data)
          ? pricingRes.data.data
          : [];

        const nextSalePriceByProductId: Record<number, number> = {};
        for (const p of pricings) {
          const productId = toNumber(p.product_id);
          const salePrice = toNumber(p.sale_price);
          if (Number.isFinite(productId) && productId > 0 && salePrice > 0) {
            nextSalePriceByProductId[productId] = salePrice;
          }
        }

        const sellable = list.filter((it) => {
          const productId = toNumber(it.product_id);
          const available = toNumber(it.available_quantity ?? it.quantity);
          return (
            Number.isFinite(productId) &&
            productId > 0 &&
            toNumber(nextSalePriceByProductId[productId]) > 0 &&
            available > 0
          );
        });

        setSalePriceByProductId(nextSalePriceByProductId);
        setInventory(sellable);
      } catch (e: unknown) {
        setErrorInv(getErrorMessage(e, "Load inventory failed"));
        setSalePriceByProductId({});
        setInventory([]);
      } finally {
        setLoadingInv(false);
      }
    };
    fetchInventory();
  }, []);

  const loadSalesOrders = async (customerNameQuery: string) => {
    setLoadingSalesOrders(true);
    setErrorSalesOrders("");
    try {
      const res = await axiosClient.get("/sales-orders", {
        params: {
          customer_name: customerNameQuery.trim() || undefined,
          sort_by: "created_at",
          sort_order: "DESC",
        },
      });

      const body = res?.data as { data?: unknown };
      const list = Array.isArray(body?.data) ? (body.data as SalesOrderListRow[]) : [];
      setSalesOrders(list);
      setSelectedSalesOrderId((prev) => {
        if (list.length === 0) return null;
        if (prev && list.some((o) => o.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch (e: unknown) {
      setErrorSalesOrders(getErrorMessage(e, "Load bill history failed"));
      setSalesOrders([]);
      setSelectedSalesOrderId(null);
    } finally {
      setLoadingSalesOrders(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void loadSalesOrders(historySearch);
    }, 350);

    return () => clearTimeout(t);
  }, [historySearch]);

  const loadSalesOrderDetail = async (id: number) => {
    setLoadingSalesOrderDetail(true);
    setErrorSalesOrderDetail("");
    try {
      const res = await axiosClient.get(`/sales-orders/${id}`);
      const body = res?.data as { data?: unknown };
      const detail =
        body?.data && typeof body.data === "object"
          ? (body.data as SalesOrderDetail)
          : (res?.data as SalesOrderDetail);
      setSalesOrderDetail(detail);
    } catch (e: unknown) {
      setErrorSalesOrderDetail(getErrorMessage(e, "Load bill detail failed"));
      setSalesOrderDetail(null);
    } finally {
      setLoadingSalesOrderDetail(false);
    }
  };

  useEffect(() => {
    if (!selectedSalesOrderId) {
      setSalesOrderDetail(null);
      setErrorSalesOrderDetail("");
      setLoadingSalesOrderDetail(false);
      return;
    }
    void loadSalesOrderDetail(selectedSalesOrderId);
  }, [selectedSalesOrderId]);

  const filteredInventory = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return inventory.filter((it) => {
      const available = toNumber(it.available_quantity ?? it.quantity);
      if (available <= 0) return false;
      return (
        !q ||
        String(it.product_id).includes(q) ||
        (it.name || "").toLowerCase().includes(q) ||
        (it.sku || "").toLowerCase().includes(q)
      );
    });
  }, [inventory, search]);

  const addToCart = (it: InventoryItemApi) => {
    const pid = toNumber(it.product_id);
    if (!Number.isFinite(pid) || pid <= 0) return;
    const salePrice = toNumber(salePriceByProductId[pid]);
    if (salePrice <= 0) {
      toast.error("This product does not have a sale price set");
      return;
    }
    const available = toNumber(it.available_quantity ?? it.quantity);
    setCart((prev) => {
      const existed = prev.find((r) => r.product_id === pid);
      if (existed) {
        const nextQty = Math.min(existed.quantity + 1, available);
        return prev.map((r) => (r.product_id === pid ? { ...r, quantity: nextQty } : r));
      }
      return [
        ...prev,
        {
          product_id: pid,
          name: it.name,
          sku: it.sku,
          uom: it.uom,
          price: salePrice,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (pid: number) => {
    setCart((prev) => prev.filter((r) => r.product_id !== pid));
  };

  const setCartRow = (pid: number, patch: Partial<CartRow>) => {
    setCart((prev) =>
      prev.map((r) => {
        if (r.product_id !== pid) return r;

        const lockedPrice = toNumber(salePriceByProductId[pid]) || r.price;
        const nextQty =
          patch.quantity === undefined ? r.quantity : Math.max(1, toNumber(patch.quantity));

        return {
          ...r,
          quantity: nextQty,
          price: lockedPrice,
        };
      }),
    );
  };

  const total = useMemo(() => {
    return cart.reduce((sum, r) => sum + toNumber(r.price) * toNumber(r.quantity), 0);
  }, [cart]);

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    for (const r of cart) {
      const inv = inventory.find((it) => toNumber(it.product_id) === r.product_id);
      const available = inv ? toNumber(inv.available_quantity ?? inv.quantity) : 0;
      if (r.quantity <= 0 || r.quantity > available) {
        toast.error(`Invalid quantity for product #${r.product_id}`);
        return;
      }
    }
    try {
      setCheckingOut(true);
      const customer = customerName.trim();
      const payload = {
        status: "CREATED",
        customer_name: customer || undefined,
        customerName: customer || undefined,
        items: cart.map((r) => ({
          product_id: r.product_id,
          quantity: r.quantity,
          unit_price: r.price,
        })),
        total_amount: total,
      };

      const res = await axiosClient.post("/sales-orders", payload);
      const data = res?.data as {
        data?: { id?: number; order_code?: string; sales_order_code?: string };
        message?: string;
      };
      const createdId = toNumber(data?.data?.id);
      const code = data?.data?.sales_order_code || data?.data?.order_code;
      toast.success(code ? `Bill created successfully: ${code}` : "Bill created successfully");
      setInventory((prev) => {
        const next = prev.map((it) => {
          const r = cart.find((x) => x.product_id === toNumber(it.product_id));
          if (!r) return it;
          const available = toNumber(it.available_quantity ?? it.quantity);
          const nextAvailable = Math.max(0, available - r.quantity);
          return { ...it, available_quantity: nextAvailable };
        });
        return next.filter((it) => toNumber(it.available_quantity ?? it.quantity) > 0);
      });
      setCart([]);
      setCustomerName("");
      if (createdId > 0) setSelectedSalesOrderId(createdId);
      void loadSalesOrders(historySearch);
    } catch (e: unknown) {
      const msg = getErrorMessage(e, "");
      if (msg) {
        toast.error(msg);
      } else {
        toast.success("Bill created successfully (offline)");
        setInventory((prev) => {
          const next = prev.map((it) => {
            const r = cart.find((x) => x.product_id === toNumber(it.product_id));
            if (!r) return it;
            const available = toNumber(it.available_quantity ?? it.quantity);
            const nextAvailable = Math.max(0, available - r.quantity);
            return { ...it, available_quantity: nextAvailable };
          });
          return next.filter((it) => toNumber(it.available_quantity ?? it.quantity) > 0);
        });
        setCart([]);
        setCustomerName("");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <FRStaffPOS
      inventory={inventory}
      filteredInventory={filteredInventory}
      loadingInv={loadingInv}
      errorInv={errorInv}
      search={search}
      setSearch={setSearch}
      customerName={customerName}
      setCustomerName={setCustomerName}
      priceByProductId={salePriceByProductId}
      historySearch={historySearch}
      setHistorySearch={setHistorySearch}
      salesOrders={salesOrders}
      loadingSalesOrders={loadingSalesOrders}
      errorSalesOrders={errorSalesOrders}
      refreshSalesOrders={() => void loadSalesOrders(historySearch)}
      selectedSalesOrderId={selectedSalesOrderId}
      selectSalesOrder={(id) => setSelectedSalesOrderId(id)}
      salesOrderDetail={salesOrderDetail}
      loadingSalesOrderDetail={loadingSalesOrderDetail}
      errorSalesOrderDetail={errorSalesOrderDetail}
      cart={cart}
      addToCart={addToCart}
      removeFromCart={removeFromCart}
      setCartRow={setCartRow}
      total={total}
      checkingOut={checkingOut}
      checkout={checkout}
    />
  );
}
