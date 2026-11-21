import { randomBytes, timingSafeEqual } from "crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./db";
import { allowDemoOrders } from "./config";
import { priceCart, ISSUE_MESSAGES, type PricedCart, type CartLineInput } from "./pricing";
import { parsePaymentMethods } from "./settings";
import type { CheckoutInput } from "./validation";

export class OrderError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateReference(now = new Date()): string {
  const y = String(now.getUTCFullYear()).slice(2);
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const bytes = randomBytes(5);
  const suffix = [...bytes].map((b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  return `JDS-${y}${m}${d}-${suffix}`;
}

export function tokensMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

type Db = PrismaClient | Prisma.TransactionClient;

async function loadPricingProducts(db: Db, items: CartLineInput[]) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  return products.map((p) => ({ ...p, imageUrl: p.images[0]?.url ?? null }));
}

async function resolveDeliveryFee(
  db: Db,
  fulfilment: "delivery" | "pickup" | undefined,
  zoneId: string | undefined,
  pickupEnabled: boolean,
) {
  if (fulfilment === "pickup") {
    if (!pickupEnabled) throw new OrderError("pickup_disabled", "Pickup is not currently available.");
    return { feeMinor: 0, zoneName: "Pickup" };
  }
  if (fulfilment === "delivery" && zoneId) {
    const zone = await db.deliveryZone.findFirst({ where: { id: zoneId, active: true } });
    if (!zone) throw new OrderError("invalid_zone", "The selected delivery area is not available.");
    return { feeMinor: zone.feeMinor, zoneName: zone.name };
  }
  return { feeMinor: 0, zoneName: "" };
}

/** Server-side price + stock check for the cart page and checkout summary. */
export async function quoteCart(
  input: { items: CartLineInput[]; fulfilmentMethod?: "delivery" | "pickup"; deliveryZoneId?: string },
  db: PrismaClient = defaultPrisma,
): Promise<PricedCart & { deliveryZoneName: string }> {
  const settings = await db.storeSettings.findUnique({ where: { id: 1 } });
  const currency = settings?.currency ?? "RWF";
  let fee = { feeMinor: 0, zoneName: "" };
  try {
    fee = await resolveDeliveryFee(db, input.fulfilmentMethod, input.deliveryZoneId, settings?.pickupEnabled ?? false);
  } catch {
    fee = { feeMinor: 0, zoneName: "" };
  }
  const products = await loadPricingProducts(db, input.items);
  const priced = priceCart(products, input.items, {
    allowDemo: allowDemoOrders(),
    currency,
    deliveryFeeMinor: fee.feeMinor,
  });
  return { ...priced, deliveryZoneName: fee.zoneName };
}

/**
 * Create an order. Prices and stock are re-read inside a transaction; stock is
 * decremented atomically so two customers cannot buy the last unit twice.
 * The same idempotencyKey always returns the same order (no duplicates).
 * Payment is NEVER marked as paid here.
 */
export async function createOrder(input: CheckoutInput, db: PrismaClient = defaultPrisma) {
  const existing = await db.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return { order: existing, duplicate: true };

  const settings = await db.storeSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new OrderError("not_configured", "The store is not configured yet.");

  const method = parsePaymentMethods(settings.paymentMethods).find((m) => m.id === input.paymentMethod && m.enabled);
  if (!method) throw new OrderError("invalid_payment_method", "Please choose an available payment method.");

  const allowDemo = allowDemoOrders();

  try {
    const order = await db.$transaction(async (tx) => {
      const fee = await resolveDeliveryFee(
        tx,
        input.fulfilmentMethod,
        input.fulfilmentMethod === "delivery" ? input.deliveryZoneId : undefined,
        settings.pickupEnabled,
      );
      const products = await loadPricingProducts(tx, input.items);
      const priced = priceCart(products, input.items, {
        allowDemo,
        currency: settings.currency,
        deliveryFeeMinor: fee.feeMinor,
      });
      const problems = priced.lines.filter((l) => l.issue);
      if (problems.length > 0) {
        throw new OrderError(
          "cart_invalid",
          problems.map((l) => `${l.name}: ${ISSUE_MESSAGES[l.issue!]}`).join(" "),
          problems.map((l) => ({ productId: l.productId, issue: l.issue })),
        );
      }

      for (const line of priced.lines) {
        const res = await tx.product.updateMany({
          where: { id: line.productId, stockQuantity: { gte: line.quantity } },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        if (res.count !== 1) {
          throw new OrderError("insufficient_stock", `${line.name}: not enough stock left.`, [
            { productId: line.productId, issue: "insufficient_stock" },
          ]);
        }
      }

      let reference = generateReference();
      for (let i = 0; i < 5 && (await tx.order.findUnique({ where: { reference } })); i++) {
        reference = generateReference();
      }

      return tx.order.create({
        data: {
          reference,
          accessToken: randomBytes(18).toString("base64url"),
          idempotencyKey: input.idempotencyKey,
          status: "pending_confirmation",
          paymentStatus: "unpaid",
          paymentMethod: method.label,
          fulfilmentMethod: input.fulfilmentMethod,
          deliveryZoneName: fee.zoneName,
          customerName: input.customerName,
          phone: input.phone,
          email: input.email,
          address: input.fulfilmentMethod === "delivery" ? input.address : "",
          city: input.fulfilmentMethod === "delivery" ? input.city : "",
          notes: input.notes,
          subtotalMinor: priced.subtotalMinor,
          deliveryFeeMinor: priced.deliveryFeeMinor,
          totalMinor: priced.totalMinor,
          currency: priced.currency,
          isDemo: priced.lines.some((l) => l.isDemo),
          items: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              productName: l.name,
              sku: l.sku,
              unitPriceMinor: l.unitPriceMinor,
              quantity: l.quantity,
              lineTotalMinor: l.lineTotalMinor,
            })),
          },
        },
      });
    });
    return { order, duplicate: false };
  } catch (err) {
    // Two identical submissions raced: return the order the first one created.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const again = await db.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (again) return { order: again, duplicate: true };
    }
    throw err;
  }
}
