import { describe, expect, it } from "vitest";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { csvCell } from "@/lib/csv";
import { whatsappLink } from "@/lib/whatsapp";

const valid = {
  idempotencyKey: "0123456789abcdef0123",
  items: [{ productId: "p1", quantity: 1 }],
  customerName: "Test Customer",
  phone: "+250 788 000 000",
  email: "",
  fulfilmentMethod: "delivery" as const,
  deliveryZoneId: "z1",
  address: "KG 123 St, house 4",
  city: "Kigali",
  notes: "",
  paymentMethod: "pay_on_delivery",
  acceptTerms: true as const,
};

describe("checkout validation", () => {
  it("accepts a complete delivery order", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("requires name, valid phone and accepted terms", () => {
    const r = checkoutSchema.safeParse({ ...valid, customerName: "", phone: "123", acceptTerms: false });
    expect(r.success).toBe(false);
    const errs = fieldErrors(r.error!);
    expect(Object.keys(errs)).toEqual(expect.arrayContaining(["customerName", "phone", "acceptTerms"]));
  });

  it("requires an address only for delivery", () => {
    const missing = checkoutSchema.safeParse({ ...valid, address: "", city: "" });
    expect(missing.success).toBe(false);
    const pickup = checkoutSchema.safeParse({ ...valid, fulfilmentMethod: "pickup", deliveryZoneId: "", address: "", city: "" });
    expect(pickup.success).toBe(true);
  });

  it("rejects invalid optional email and empty carts", () => {
    expect(checkoutSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, items: [] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, items: [{ productId: "p1", quantity: 0 }] }).success).toBe(false);
  });
});

describe("helpers", () => {
  it("neutralises CSV formula injection and quotes special characters", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell("plain")).toBe("plain");
  });

  it("never builds a WhatsApp link without a configured number", () => {
    expect(whatsappLink("")).toBeNull();
    expect(whatsappLink("+250 788 123 456", "Hi")).toBe("https://wa.me/250788123456?text=Hi");
  });
});
