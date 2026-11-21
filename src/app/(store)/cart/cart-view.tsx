"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useQuote } from "@/components/cart/use-quote";
import { ProductImage } from "@/components/product-image";
import { formatMoney } from "@/lib/money";
import { ISSUE_MESSAGES } from "@/lib/pricing";

export function CartView() {
  const { items, ready, setQuantity, remove } = useCart();
  const { quote, loading, error } = useQuote(items, ready);

  // Keep stored display prices in sync with the server's current prices.
  useEffect(() => {
    if (!quote) return;
    for (const line of quote.lines) {
      const local = items.find((i) => i.productId === line.productId);
      if (local && !line.issue && local.quantity > line.maxQuantity && line.maxQuantity > 0) setQuantity(line.productId, line.maxQuantity);
    }
  }, [quote, items, setQuantity]);

  if (!ready) {
    return <p className="mt-8 text-muted">Loading your cart…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="card mt-8 p-10 text-center">
        <h2 className="font-display text-2xl text-forest">Your cart is empty</h2>
        <p className="mt-2 text-muted">Browse our honey and beeswax products to get started.</p>
        <Link href="/shop" className="btn-primary mt-6">
          Shop products
        </Link>
      </div>
    );
  }

  const currency = quote?.currency ?? items[0].currency;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section aria-label="Cart items">
        <ul className="divide-y divide-line rounded-2xl border border-line bg-cream">
          {items.map((item) => {
            const line = quote?.lines.find((l) => l.productId === item.productId);
            const unit = line && !line.issue ? line.unitPriceMinor : item.priceMinor;
            const max = line?.maxQuantity ?? 50;
            return (
              <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
                <Link href={`/product/${item.slug}`} className="block w-20 shrink-0 sm:w-24">
                  <ProductImage src={item.imageUrl} alt="" className="aspect-square rounded-xl" sizes="96px" />
                </Link>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/product/${item.slug}`} className="font-medium text-forest hover:underline">
                      {line?.name ?? item.name}
                    </Link>
                    <span className="whitespace-nowrap font-semibold">{formatMoney(unit * item.quantity, currency)}</span>
                  </div>
                  <p className="text-sm text-muted">{formatMoney(unit, currency)} each</p>
                  {line?.issue && (
                    <p className="text-sm font-medium text-red-700 dark:text-red-300" role="alert">
                      {ISSUE_MESSAGES[line.issue]}
                      {line.issue === "insufficient_stock" && line.maxQuantity > 0 && ` Only ${line.maxQuantity} available.`}
                    </p>
                  )}
                  {line && !line.issue && line.unitPriceMinor !== item.priceMinor && (
                    <p className="text-sm text-[#7a5a0c] dark:text-gold">The price of this item has changed since you added it.</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button type="button" className="h-9 w-9 rounded-full text-forest hover:bg-forest/10" onClick={() => setQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`}>
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" aria-label={`Quantity ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full text-forest hover:bg-forest/10 disabled:opacity-40"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= max}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" onClick={() => remove(item.productId)} className="text-sm text-muted underline hover:text-red-700">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-forest underline decoration-gold underline-offset-4">
          Continue shopping
        </Link>
      </section>

      <aside className="card h-fit p-6" aria-label="Order summary">
        <h2 className="font-display text-xl text-forest">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-semibold">{quote ? formatMoney(quote.subtotalMinor, currency) : "…"}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>
        <p className="mt-2 min-h-5 text-xs text-muted" aria-live="polite">
          {loading ? "Checking current prices and stock…" : "Prices and stock checked just now."}
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {quote?.hasIssues && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
            Please fix or remove the highlighted items before checking out.
          </p>
        )}
        {quote && !quote.hasIssues ? (
          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Proceed to checkout
          </Link>
        ) : (
          <button type="button" className="btn-primary mt-5 w-full" disabled>
            Proceed to checkout
          </button>
        )}
      </aside>
    </div>
  );
}
