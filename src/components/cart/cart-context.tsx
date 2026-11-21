"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";

/** Client cart. Prices here are display hints only — the server re-prices everything. */
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "jados_cart_v1";

function sanitise(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (i) =>
        i &&
        typeof i.productId === "string" &&
        typeof i.name === "string" &&
        Number.isInteger(i.priceMinor) &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0,
    )
    .slice(0, 50)
    .map((i) => ({
      productId: i.productId,
      slug: String(i.slug ?? ""),
      name: i.name.slice(0, 200),
      priceMinor: i.priceMinor,
      currency: String(i.currency ?? "RWF"),
      imageUrl: typeof i.imageUrl === "string" ? i.imageUrl : null,
      quantity: Math.min(i.quantity, MAX_QTY_PER_LINE),
    }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(sanitise(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")));
    } catch {
      setItems([]);
    }
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setItems(sanitise(JSON.parse(e.newValue ?? "[]")));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private mode) — cart still works for this visit */
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, MAX_QTY_PER_LINE) } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, MAX_QTY_PER_LINE) }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, MAX_QTY_PER_LINE) } : i)),
    );
  }, []);

  const remove = useCallback((productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, count: items.reduce((n, i) => n + i.quantity, 0), add, setQuantity, remove, clear }),
    [items, ready, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
