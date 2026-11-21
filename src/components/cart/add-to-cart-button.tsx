"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartItem } from "./cart-context";

export function AddToCartButton({
  item,
  maxQuantity,
  compact = false,
  withQuantity = false,
}: {
  item: Omit<CartItem, "quantity">;
  maxQuantity: number;
  compact?: boolean;
  withQuantity?: boolean;
}) {
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.productId === item.productId)?.quantity ?? 0;
  const remaining = Math.max(0, Math.min(maxQuantity, 50) - inCart);

  function onAdd() {
    const amount = Math.min(qty, remaining);
    if (amount <= 0) return;
    add(item, amount);
    setAdded(true);
    setQty(1);
    window.setTimeout(() => setAdded(false), 2500);
  }

  if (compact) {
    return (
      <button type="button" onClick={onAdd} disabled={remaining <= 0} className="btn-primary px-4 py-2" aria-label={`Add ${item.name} to cart`}>
        {added ? "Added ✓" : remaining <= 0 ? "Max in cart" : "Add"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {withQuantity && (
          <div className="flex items-center rounded-full border border-line bg-cream">
            <button type="button" className="h-11 w-11 rounded-full text-lg text-forest hover:bg-forest/10 disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
              −
            </button>
            <span className="w-8 text-center font-semibold" aria-live="polite" aria-label={`Quantity ${qty}`}>
              {qty}
            </span>
            <button type="button" className="h-11 w-11 rounded-full text-lg text-forest hover:bg-forest/10 disabled:opacity-40" onClick={() => setQty((q) => Math.min(remaining, q + 1))} disabled={qty >= remaining} aria-label="Increase quantity">
              +
            </button>
          </div>
        )}
        <button type="button" onClick={onAdd} disabled={remaining <= 0} className="btn-primary h-11 px-7">
          {remaining <= 0 ? "Maximum available in cart" : "Add to cart"}
        </button>
      </div>
      <p className="min-h-5 text-sm text-botanical" role="status" aria-live="polite">
        {added && (
          <>
            Added to your cart.{" "}
            <Link href="/cart" className="font-semibold underline decoration-gold underline-offset-4">
              View cart
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
