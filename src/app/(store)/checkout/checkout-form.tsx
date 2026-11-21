"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useQuote } from "@/components/cart/use-quote";
import { formatMoney } from "@/lib/money";
import { ISSUE_MESSAGES } from "@/lib/pricing";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import type { PaymentMethod } from "@/lib/settings";

type Zone = { id: string; name: string; feeMinor: number; eta: string };

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutForm({
  zones,
  paymentMethods,
  pickupEnabled,
  pickupInstructions,
  currency,
}: {
  zones: Zone[];
  paymentMethods: PaymentMethod[];
  pickupEnabled: boolean;
  pickupInstructions: string;
  currency: string;
}) {
  const router = useRouter();
  const { items, ready, clear } = useCart();
  const idempotencyKey = useRef<string>("");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    fulfilmentMethod: (zones.length > 0 ? "delivery" : "pickup") as "delivery" | "pickup",
    deliveryZoneId: zones[0]?.id ?? "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: paymentMethods[0]?.id ?? "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const { quote, loading } = useQuote(items, ready, form.fulfilmentMethod, form.deliveryZoneId);

  useEffect(() => {
    if (!idempotencyKey.current) idempotencyKey.current = newKey();
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  if (!ready) return <p className="mt-8 text-muted">Loading…</p>;
  if (placed) return <p className="mt-8 text-muted" role="status">Order placed — opening your confirmation…</p>;

  if (items.length === 0) {
    return (
      <div className="card mt-8 p-10 text-center">
        <h2 className="font-display text-2xl text-forest">Your cart is empty</h2>
        <Link href="/shop" className="btn-primary mt-6">
          Shop products
        </Link>
      </div>
    );
  }

  const noFulfilment = zones.length === 0 && !pickupEnabled;
  const noPayment = paymentMethods.length === 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);
    const payload = {
      ...form,
      idempotencyKey: idempotencyKey.current || (idempotencyKey.current = newKey()),
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      // zod skips the delivery-specific refinement while basic fields fail; show those errors up front too.
      if (form.fulfilmentMethod === "delivery") {
        if (form.address.trim().length < 5) errs.address ??= "Enter a delivery address";
        if (form.city.trim().length < 2) errs.city ??= "Enter your city or district";
      }
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    if (quote?.hasIssues) {
      setServerError("Some items in your cart are no longer available. Please review your cart.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setServerError(data.error ?? "We could not place your order. Please try again.");
        setSubmitting(false);
        return;
      }
      setPlaced(true);
      clear();
      router.push(`/order-confirmation/${encodeURIComponent(data.reference)}?t=${encodeURIComponent(data.token)}`);
    } catch {
      // Network problem: keep the same idempotency key so a retry can't create a duplicate order.
      setServerError("Network problem — please check your connection and try again. You will not be charged twice.");
      setSubmitting(false);
    }
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`e-${k}`} className="field-error">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `e-${k}` : undefined });
  const selectedPayment = paymentMethods.find((m) => m.id === form.paymentMethod);

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-8">
        <fieldset className="card space-y-4 p-6">
          <legend className="px-1 font-display text-xl text-forest">1. Your details</legend>
          <div>
            <label htmlFor="f-customerName" className="label">
              Full name *
            </label>
            <input id="f-customerName" className="input" autoComplete="name" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} {...aria("customerName")} />
            {err("customerName")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-phone" className="label">
                Phone number *
              </label>
              <input id="f-phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="+250 7XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />
              {err("phone")}
            </div>
            <div>
              <label htmlFor="f-email" className="label">
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input id="f-email" type="email" className="input" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
              {err("email")}
            </div>
          </div>
          <p className="text-xs text-muted">We use your phone number to confirm the order. Your details are only used to fulfil this order.</p>
        </fieldset>

        <fieldset className="card space-y-4 p-6">
          <legend className="px-1 font-display text-xl text-forest">2. Delivery or pickup</legend>
          {noFulfilment && <p className="text-sm text-red-700">Delivery and pickup are not configured yet. Please contact us to order.</p>}
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Fulfilment method">
            {zones.length > 0 && (
              <label className={`card flex cursor-pointer items-start gap-3 p-4 ${form.fulfilmentMethod === "delivery" ? "border-forest ring-2 ring-forest/20" : ""}`}>
                <input type="radio" name="fulfilment" value="delivery" checked={form.fulfilmentMethod === "delivery"} onChange={() => set("fulfilmentMethod", "delivery")} className="mt-1 accent-[var(--forest)]" />
                <span>
                  <span className="block font-medium">Delivery</span>
                  <span className="text-sm text-muted">To your address</span>
                </span>
              </label>
            )}
            {pickupEnabled && (
              <label className={`card flex cursor-pointer items-start gap-3 p-4 ${form.fulfilmentMethod === "pickup" ? "border-forest ring-2 ring-forest/20" : ""}`}>
                <input type="radio" name="fulfilment" value="pickup" checked={form.fulfilmentMethod === "pickup"} onChange={() => set("fulfilmentMethod", "pickup")} className="mt-1 accent-[var(--forest)]" />
                <span>
                  <span className="block font-medium">Pickup</span>
                  <span className="text-sm text-muted">Free</span>
                </span>
              </label>
            )}
          </div>

          {form.fulfilmentMethod === "delivery" ? (
            <>
              <div>
                <label htmlFor="f-deliveryZoneId" className="label">
                  Delivery area *
                </label>
                <select id="f-deliveryZoneId" className="input" value={form.deliveryZoneId} onChange={(e) => set("deliveryZoneId", e.target.value)} {...aria("deliveryZoneId")}>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {formatMoney(z.feeMinor, currency)}
                      {z.eta ? ` · ${z.eta}` : ""}
                    </option>
                  ))}
                </select>
                {err("deliveryZoneId")}
              </div>
              <div>
                <label htmlFor="f-address" className="label">
                  Delivery address *
                </label>
                <textarea id="f-address" rows={2} className="input" autoComplete="street-address" placeholder="Street, house number, nearby landmark" value={form.address} onChange={(e) => set("address", e.target.value)} {...aria("address")} />
                {err("address")}
              </div>
              <div>
                <label htmlFor="f-city" className="label">
                  City / district *
                </label>
                <input id="f-city" className="input" autoComplete="address-level2" placeholder="e.g. Kigali — Gasabo" value={form.city} onChange={(e) => set("city", e.target.value)} {...aria("city")} />
                {err("city")}
              </div>
            </>
          ) : (
            pickupInstructions && <p className="rounded-xl bg-paper p-3 text-sm text-ink/85">{pickupInstructions}</p>
          )}
          <div>
            <label htmlFor="f-notes" className="label">
              Delivery instructions / notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea id="f-notes" rows={2} className="input" value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={500} />
          </div>
        </fieldset>

        <fieldset className="card space-y-4 p-6">
          <legend className="px-1 font-display text-xl text-forest">3. Payment</legend>
          {noPayment ? (
            <p className="text-sm text-red-700">No payment method is configured yet. Please contact us to order.</p>
          ) : (
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {paymentMethods.map((m) => (
                <label key={m.id} className={`card flex cursor-pointer items-start gap-3 p-4 ${form.paymentMethod === m.id ? "border-forest ring-2 ring-forest/20" : ""}`}>
                  <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={() => set("paymentMethod", m.id)} className="mt-1 accent-[var(--forest)]" />
                  <span>
                    <span className="block font-medium">{m.label}</span>
                    {m.instructions && <span className="mt-1 block text-sm text-muted">{m.instructions}</span>}
                  </span>
                </label>
              ))}
            </div>
          )}
          {err("paymentMethod")}
          <p className="rounded-xl bg-gold/15 p-3 text-sm text-ink/85">
            <strong>No online payment is taken.</strong> We never ask for card details on this website. Your order stays{" "}
            <em>unpaid</em> until we confirm payment with you directly.
          </p>
        </fieldset>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24" aria-label="Order summary">
        <div className="card p-6">
          <h2 className="font-display text-xl text-forest">Order summary</h2>
          <ul className="mt-4 divide-y divide-line text-sm">
            {(quote?.lines ?? []).map((l) => (
              <li key={l.productId} className="flex justify-between gap-3 py-2.5">
                <span>
                  {l.name} <span className="text-muted">× {l.quantity}</span>
                  {l.issue && <span className="block text-red-700 dark:text-red-300">{ISSUE_MESSAGES[l.issue]}</span>}
                </span>
                <span className="whitespace-nowrap font-medium">{formatMoney(l.lineTotalMinor, currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{quote ? formatMoney(quote.subtotalMinor, currency) : "…"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{form.fulfilmentMethod === "pickup" ? "Pickup" : `Delivery${quote?.deliveryZoneName ? ` (${quote.deliveryZoneName})` : ""}`}</dt>
              <dd>{quote ? formatMoney(quote.deliveryFeeMinor, currency) : "…"}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{quote ? formatMoney(quote.totalMinor, currency) : "…"}</dd>
            </div>
          </dl>
          {selectedPayment && <p className="mt-3 text-xs text-muted">Payment: {selectedPayment.label}</p>}
          <p className="mt-1 min-h-4 text-xs text-muted" aria-live="polite">
            {loading ? "Updating…" : ""}
          </p>

          <label className="mt-4 flex items-start gap-2 text-sm">
            <input id="f-acceptTerms" type="checkbox" checked={form.acceptTerms} onChange={(e) => set("acceptTerms", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--forest)]" {...aria("acceptTerms")} />
            <span>
              I understand this is an order request that JADOS will confirm by phone, and I have read the{" "}
              <Link href="/terms" target="_blank" className="underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/shipping-returns" target="_blank" className="underline">
                delivery &amp; returns policy
              </Link>
              .
            </span>
          </label>
          {err("acceptTerms")}

          {serverError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200" role="alert">
              {serverError}
            </p>
          )}

          <button type="submit" className="btn-primary mt-5 h-12 w-full text-base" disabled={submitting || noPayment || noFulfilment || !quote || quote.hasIssues}>
            {submitting ? "Placing order…" : "Place order request"}
          </button>
          {quote?.hasIssues && (
            <Link href="/cart" className="mt-3 block text-center text-sm text-forest underline">
              Review cart
            </Link>
          )}
        </div>
      </aside>
    </form>
  );
}
