import FRStaffPOS from "../../../components/FRStaffPOS";
import { useEffect, useMemo, useState } from "react";
import inventoryApi, { type InventoryItemApi } from "../../../api/inventoryApi";
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

function toNumber(v: string | number | undefined) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

export default function FRStaffPOSPage() {
  const [inventory, setInventory] = useState<InventoryItemApi[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [errorInv, setErrorInv] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartRow[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInv(true);
      setErrorInv("");
      try {
        const res = await inventoryApi.getAll();
        const list = Array.isArray(res?.data) ? res.data : [];
        setInventory(list);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        setErrorInv(err?.response?.data?.message || err?.message || "Load inventory failed");
        setInventory([]);
      } finally {
        setLoadingInv(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return inventory.filter((it) => {
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
          price: 0,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (pid: number) => {
    setCart((prev) => prev.filter((r) => r.product_id !== pid));
  };

  const setCartRow = (pid: number, patch: Partial<CartRow>) => {
    setCart((prev) => prev.map((r) => (r.product_id === pid ? { ...r, ...patch } : r)));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, r) => sum + toNumber(r.price) * toNumber(r.quantity), 0);
  }, [cart]);

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }
    for (const r of cart) {
      const inv = inventory.find((it) => toNumber(it.product_id) === r.product_id);
      const available = inv ? toNumber(inv.available_quantity ?? inv.quantity) : 0;
      if (r.quantity <= 0 || r.quantity > available) {
        toast.error(`Số lượng không hợp lệ cho sản phẩm #${r.product_id}`);
        return;
      }
    }
    try {
      setCheckingOut(true);
      await axiosClient.post("/pos/sales", {
        items: cart.map((r) => ({
          product_id: r.product_id,
          quantity: r.quantity,
          unit_price: r.price,
        })),
        total_amount: total,
      });
      toast.success("Thanh toán thành công");
      setInventory((prev) =>
        prev.map((it) => {
          const r = cart.find((x) => x.product_id === toNumber(it.product_id));
          if (!r) return it;
          const available = toNumber(it.available_quantity ?? it.quantity);
          const nextAvailable = Math.max(0, available - r.quantity);
          return { ...it, available_quantity: nextAvailable };
        }),
      );
      setCart([]);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message || err?.message;
      if (msg) {
        toast.error(msg);
      } else {
        toast.success("Thanh toán (offline) thành công");
        setInventory((prev) =>
          prev.map((it) => {
            const r = cart.find((x) => x.product_id === toNumber(it.product_id));
            if (!r) return it;
            const available = toNumber(it.available_quantity ?? it.quantity);
            const nextAvailable = Math.max(0, available - r.quantity);
            return { ...it, available_quantity: nextAvailable };
          }),
        );
        setCart([]);
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
