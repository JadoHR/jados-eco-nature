import { describe, expect, it } from "vitest";
import { normaliseItems, priceCart, type PricingProduct } from "@/lib/pricing";

const base: PricingProduct = {
  id: "honey",
  name: "Honey",
  slug: "honey",
  sku: "H1",
  priceMinor: 5000,
  currency: "RWF",
  stockQuantity: 10,
  status: "published",
  isConcept: false,
  isDemo: false,
};
const candle: PricingProduct = { ...base, id: "candle", name: "Candle", slug: "candle", sku: "C1", priceMinor: 7000, stockQuantity: 2 };
const opts = { allowDemo: false, currency: "RWF", deliveryFeeMinor: 2000 };

describe("priceCart", () => {
  it("calculates subtotal, delivery and total from database prices", () => {
    const r = priceCart([base, candle], [{ productId: "honey", quantity: 3 }, { productId: "candle", quantity: 1 }], opts);
    expect(r.subtotalMinor).toBe(3 * 5000 + 7000);
    expect(r.deliveryFeeMinor).toBe(2000);
    expect(r.totalMinor).toBe(22000 + 2000);
    expect(r.hasIssues).toBe(false);
  });

  it("merges duplicate lines", () => {
    expect(normaliseItems([{ productId: "a", quantity: 1 }, { productId: "a", quantity: 2 }])).toEqual([{ productId: "a", quantity: 3 }]);
  });

  it("flags quantities above stock", () => {
    const r = priceCart([candle], [{ productId: "candle", quantity: 3 }], opts);
    expect(r.lines[0].issue).toBe("insufficient_stock");
    expect(r.lines[0].maxQuantity).toBe(2);
    expect(r.hasIssues).toBe(true);
    expect(r.totalMinor).toBe(0);
  });

  it("blocks out-of-stock, concept, draft and unknown products", () => {
    const r = priceCart(
      [
        { ...base, id: "oos", stockQuantity: 0 },
        { ...base, id: "concept", isConcept: true },
        { ...base, id: "draft", status: "draft" },
      ],
      [
        { productId: "oos", quantity: 1 },
        { productId: "concept", quantity: 1 },
        { productId: "draft", quantity: 1 },
        { productId: "ghost", quantity: 1 },
      ],
      opts,
    );
    expect(r.lines.map((l) => l.issue)).toEqual(["out_of_stock", "concept", "unavailable", "not_found"]);
  });

  it("blocks demo products unless demo ordering is allowed", () => {
    const demo = { ...base, isDemo: true };
    expect(priceCart([demo], [{ productId: "honey", quantity: 1 }], opts).lines[0].issue).toBe("demo_blocked");
    expect(priceCart([demo], [{ productId: "honey", quantity: 1 }], { ...opts, allowDemo: true }).lines[0].issue).toBeNull();
  });

  it("ignores a client-supplied price — only the product record counts", () => {
    const tampered = [{ productId: "honey", quantity: 1, priceMinor: 1 }] as unknown as { productId: string; quantity: number }[];
    expect(priceCart([base], tampered, opts).subtotalMinor).toBe(5000);
  });

  it("charges no delivery fee for an empty or fully invalid cart", () => {
    expect(priceCart([], [], opts).totalMinor).toBe(0);
  });

  it("rejects currency mismatches", () => {
    const r = priceCart([{ ...base, currency: "USD" }], [{ productId: "honey", quantity: 1 }], opts);
    expect(r.lines[0].issue).toBe("currency_mismatch");
  });
});
