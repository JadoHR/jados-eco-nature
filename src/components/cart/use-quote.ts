"use client";

import { useEffect, useState } from "react";
import type { PricedCart } from "@/lib/pricing";
import type { CartItem } from "./cart-context";

export type Quote = PricedCart & { deliveryZoneName: string };

/** Asks the server to re-price the cart whenever items or delivery choice change. */
export function useQuote(items: CartItem[], ready: boolean, fulfilment?: "delivery" | "pickup", zoneId?: string) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(items.map((i) => [i.productId, i.quantity])) + `|${fulfilment ?? ""}|${zoneId ?? ""}`;

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      setQuote(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/cart/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            fulfilmentMethod: fulfilment,
            deliveryZoneId: fulfilment === "delivery" ? zoneId || undefined : undefined,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Could not check prices");
        setQuote(await res.json());
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("We could not check current prices. Please refresh the page.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 150);
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  return { quote, loading, error };
}
