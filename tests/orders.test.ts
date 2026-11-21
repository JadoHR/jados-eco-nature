import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createOrder, OrderError, quoteCart, tokensMatch } from "@/lib/orders";
import type { CheckoutInput } from "@/lib/validation";

const db = new PrismaClient({ datasourceUrl: "file:./test.db" });

let honeyId = "";
let candleId = "";
let conceptId = "";
let zoneId = "";

beforeEach(async () => {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.deliveryZone.deleteMany();
  await db.storeSettings.deleteMany();

  await db.storeSettings.create({
    data: {
      id: 1,
      currency: "RWF",
      pickupEnabled: true,
      paymentMethods: JSON.stringify([{ id: "pay_on_delivery", label: "Pay on delivery", instructions: "", enabled: true }]),
    },
  });
  const cat = await db.category.create({ data: { name: "Honey", slug: "honey" } });
  const common = { categoryId: cat.id, currency: "RWF", status: "published", shortDescription: "x", description: "x" };
  honeyId = (await db.product.create({ data: { ...common, name: "Honey", slug: "honey", sku: "H", priceMinor: 5000, stockQuantity: 5 } })).id;
  candleId = (await db.product.create({ data: { ...common, name: "Candle", slug: "candle", sku: "C", priceMinor: 7000, stockQuantity: 1 } })).id;
  conceptId = (await db.product.create({ data: { ...common, name: "Serum", slug: "serum", sku: "S", priceMinor: 0, stockQuantity: 100, isConcept: true } })).id;
  zoneId = (await db.deliveryZone.create({ data: { name: "Kigali", feeMinor: 2000 } })).id;
});

afterAll(async () => {
  await db.$disconnect();
});

const input = (over: Partial<CheckoutInput> = {}): CheckoutInput => ({
  idempotencyKey: `key-${Math.random().toString(36).slice(2)}-${Date.now()}`,
  items: [{ productId: honeyId, quantity: 2 }],
  customerName: "Test Customer",
  phone: "+250788000000",
  email: "",
  fulfilmentMethod: "delivery",
  deliveryZoneId: zoneId,
  address: "KG 1 St",
  city: "Kigali",
  notes: "",
  paymentMethod: "pay_on_delivery",
  acceptTerms: true,
  ...over,
});

describe("createOrder", () => {
  it("creates one unpaid order with server prices, snapshots and decremented stock", async () => {
    const { order } = await createOrder(input(), db);
    expect(order.reference).toMatch(/^JDS-\d{6}-[A-Z2-9]{5}$/);
    expect(order.status).toBe("pending_confirmation");
    expect(order.paymentStatus).toBe("unpaid");
    expect(order.subtotalMinor).toBe(10000);
    expect(order.deliveryFeeMinor).toBe(2000);
    expect(order.totalMinor).toBe(12000);

    const items = await db.orderItem.findMany({ where: { orderId: order.id } });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ productName: "Honey", unitPriceMinor: 5000, quantity: 2, lineTotalMinor: 10000 });
    expect((await db.product.findUnique({ where: { id: honeyId } }))!.stockQuantity).toBe(3);
  });

  it("keeps the price snapshot when the product price later changes", async () => {
    const { order } = await createOrder(input(), db);
    await db.product.update({ where: { id: honeyId }, data: { priceMinor: 9999, name: "Renamed" } });
    const items = await db.orderItem.findMany({ where: { orderId: order.id } });
    expect(items[0].unitPriceMinor).toBe(5000);
    expect(items[0].productName).toBe("Honey");
  });

  it("is idempotent: the same key never creates a second order", async () => {
    const data = input();
    const a = await createOrder(data, db);
    const b = await createOrder(data, db);
    expect(b.duplicate).toBe(true);
    expect(b.order.id).toBe(a.order.id);
    expect(await db.order.count()).toBe(1);
    expect((await db.product.findUnique({ where: { id: honeyId } }))!.stockQuantity).toBe(3);
  });

  it("generates unique references", async () => {
    const refs = new Set<string>();
    for (let i = 0; i < 5; i++) refs.add((await createOrder(input({ items: [{ productId: honeyId, quantity: 1 }] }), db)).order.reference);
    expect(refs.size).toBe(5);
  });

  it("rejects quantities above stock and leaves stock untouched", async () => {
    await expect(createOrder(input({ items: [{ productId: candleId, quantity: 2 }] }), db)).rejects.toBeInstanceOf(OrderError);
    expect((await db.product.findUnique({ where: { id: candleId } }))!.stockQuantity).toBe(1);
    expect(await db.order.count()).toBe(0);
  });

  it("cannot sell the last unit twice", async () => {
    await createOrder(input({ items: [{ productId: candleId, quantity: 1 }] }), db);
    await expect(createOrder(input({ items: [{ productId: candleId, quantity: 1 }] }), db)).rejects.toMatchObject({ code: "cart_invalid" });
    expect(await db.order.count()).toBe(1);
  });

  it("never sells concept products", async () => {
    await expect(createOrder(input({ items: [{ productId: conceptId, quantity: 1 }] }), db)).rejects.toMatchObject({ code: "cart_invalid" });
  });

  it("rolls back the whole order if any line fails", async () => {
    await expect(
      createOrder(input({ items: [{ productId: honeyId, quantity: 1 }, { productId: candleId, quantity: 5 }] }), db),
    ).rejects.toBeInstanceOf(OrderError);
    expect((await db.product.findUnique({ where: { id: honeyId } }))!.stockQuantity).toBe(5);
  });

  it("rejects unknown payment methods and inactive delivery zones", async () => {
    await expect(createOrder(input({ paymentMethod: "bitcoin" }), db)).rejects.toMatchObject({ code: "invalid_payment_method" });
    await db.deliveryZone.update({ where: { id: zoneId }, data: { active: false } });
    await expect(createOrder(input(), db)).rejects.toMatchObject({ code: "invalid_zone" });
  });

  it("charges no delivery fee for pickup", async () => {
    const { order } = await createOrder(input({ fulfilmentMethod: "pickup", deliveryZoneId: "", address: "", city: "" }), db);
    expect(order.deliveryFeeMinor).toBe(0);
    expect(order.totalMinor).toBe(10000);
  });

  it("issues a private access token for the confirmation page", async () => {
    const { order } = await createOrder(input(), db);
    expect(order.accessToken.length).toBeGreaterThanOrEqual(20);
    expect(tokensMatch(order.accessToken, order.accessToken)).toBe(true);
    expect(tokensMatch(order.accessToken, "wrong")).toBe(false);
  });
});

describe("quoteCart", () => {
  it("returns current server prices and the delivery fee", async () => {
    const q = await quoteCart({ items: [{ productId: honeyId, quantity: 1 }], fulfilmentMethod: "delivery", deliveryZoneId: zoneId }, db);
    expect(q.subtotalMinor).toBe(5000);
    expect(q.deliveryFeeMinor).toBe(2000);
    expect(q.totalMinor).toBe(7000);
  });
});
