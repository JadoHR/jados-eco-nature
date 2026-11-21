// Environment-level configuration (not editable from the admin).

export function storeMode(): "demo" | "live" {
  return process.env.STORE_MODE === "live" ? "live" : "demo";
}

/** Demo-flagged products can only be ordered while the store runs in demo mode. */
export function allowDemoOrders(): boolean {
  return storeMode() === "demo";
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const ORDER_STATUSES = [
  { value: "pending_confirmation", label: "New — pending confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "ready_for_dispatch", label: "Ready for dispatch" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid (verified by admin)" },
  { value: "refunded", label: "Refunded" },
] as const;

export function orderStatusLabel(value: string): string {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;
}
