// Pure cart pricing / validation used by BOTH the cart quote endpoint and order creation.
// Prices always come from the database records passed in — never from the client.

export type PricingProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  status: string;
  isConcept: boolean;
  isDemo: boolean;
  imageUrl?: string | null;
};

export type CartLineInput = { productId: string; quantity: number };

export type LineIssue =
  | "not_found"
  | "unavailable"
  | "concept"
  | "demo_blocked"
  | "out_of_stock"
  | "insufficient_stock"
  | "currency_mismatch";

export type PricedLine = {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  imageUrl: string | null;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
  maxQuantity: number;
  isDemo: boolean;
  issue: LineIssue | null;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  currency: string;
  hasIssues: boolean;
};

export const MAX_QTY_PER_LINE = 50;

export const ISSUE_MESSAGES: Record<LineIssue, string> = {
  not_found: "This product no longer exists.",
  unavailable: "This product is not currently available.",
  concept: "This is a concept product and is not for sale yet.",
  demo_blocked: "This is a demo listing and cannot be ordered.",
  out_of_stock: "Out of stock.",
  insufficient_stock: "Not enough stock for the requested quantity.",
  currency_mismatch: "This product is priced in a different currency.",
};

/** Merge duplicate product lines and clamp quantities to sane bounds. */
export function normaliseItems(items: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }
  return [...merged.entries()].map(([productId, quantity]) => ({
    productId,
    quantity: Math.min(quantity, MAX_QTY_PER_LINE),
  }));
}

export function isPurchasable(p: PricingProduct, allowDemo: boolean): LineIssue | null {
  if (p.status !== "published") return "unavailable";
  if (p.isConcept) return "concept";
  if (p.isDemo && !allowDemo) return "demo_blocked";
  if (p.stockQuantity <= 0) return "out_of_stock";
  return null;
}

export function priceCart(
  products: PricingProduct[],
  items: CartLineInput[],
  opts: { allowDemo: boolean; currency: string; deliveryFeeMinor: number },
): PricedCart {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: PricedLine[] = [];

  for (const item of normaliseItems(items)) {
    const p = byId.get(item.productId);
    if (!p) {
      lines.push({
        productId: item.productId,
        name: "Unavailable product",
        slug: "",
        sku: "",
        imageUrl: null,
        unitPriceMinor: 0,
        quantity: item.quantity,
        lineTotalMinor: 0,
        maxQuantity: 0,
        isDemo: false,
        issue: "not_found",
      });
      continue;
    }
    let issue: LineIssue | null = isPurchasable(p, opts.allowDemo);
    if (!issue && p.currency !== opts.currency) issue = "currency_mismatch";
    if (!issue && item.quantity > p.stockQuantity) issue = "insufficient_stock";

    const lineTotal = issue ? 0 : p.priceMinor * item.quantity;
    lines.push({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      imageUrl: p.imageUrl ?? null,
      unitPriceMinor: p.priceMinor,
      quantity: item.quantity,
      lineTotalMinor: lineTotal,
      maxQuantity: Math.max(0, Math.min(p.stockQuantity, MAX_QTY_PER_LINE)),
      isDemo: p.isDemo,
      issue,
    });
  }

  const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
  const hasItems = lines.some((l) => !l.issue);
  const deliveryFeeMinor = hasItems ? opts.deliveryFeeMinor : 0;
  if (!Number.isSafeInteger(subtotalMinor + deliveryFeeMinor)) throw new Error("Order total overflow");

  return {
    lines,
    subtotalMinor,
    deliveryFeeMinor,
    totalMinor: subtotalMinor + deliveryFeeMinor,
    currency: opts.currency,
    hasIssues: lines.some((l) => l.issue !== null),
  };
}
