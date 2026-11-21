"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  audit,
  clearLoginFailures,
  endSession,
  loginThrottled,
  recordLoginFailure,
  requireAdmin,
  startSession,
} from "@/lib/auth";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/config";
import { parseMoneyInput } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import {
  categorySchema,
  deliveryZoneSchema,
  fieldErrors,
  loginSchema,
  productSchema,
  settingsSchema,
} from "@/lib/validation";

export type ActionState = { ok?: boolean; message?: string; error?: string; fields?: Record<string, string> };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const int = (fd: FormData, k: string) => {
  const v = str(fd, k).trim();
  return /^-?\d+$/.test(v) ? Number(v) : NaN;
};

function uniqueError(err: unknown): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = (err.meta?.target as string[] | string | undefined)?.toString() ?? "field";
    return `That ${target.includes("slug") ? "slug" : target.includes("sku") ? "SKU" : "value"} is already in use.`;
  }
  return null;
}

/* ---------------------------------- Auth ---------------------------------- */

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return { error: "Enter your email and password." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${parsed.data.email}|${ip}`;
  if (loginThrottled(key)) return { error: "Too many attempts. Please wait 15 minutes and try again." };

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Always run bcrypt to keep timing similar whether or not the account exists.
  const hash = admin?.passwordHash ?? "$2a$12$CwTycUXWue0Thq9StjUM0uJ8W8Qx4y6bG3V5n6Q4mGq1o1V6mY8Nq";
  const ok = await bcrypt.compare(parsed.data.password, hash);
  if (!admin || !ok) {
    recordLoginFailure(key);
    return { error: "Incorrect email or password." };
  }
  clearLoginFailures(key);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await audit(admin.id, "admin.login", "AdminUser", admin.id);
  await startSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

/* -------------------------------- Products -------------------------------- */

export async function saveProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const settings = await getSettings();

  const priceMinor = parseMoneyInput(str(fd, "price"), settings.currency);
  if (priceMinor === null) return { error: "Please correct the highlighted fields.", fields: { priceMinor: "Enter a valid price, e.g. 5000" } };

  const images: { url: string; alt: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const url = str(fd, `imageUrl${i}`).trim();
    const alt = str(fd, `imageAlt${i}`).trim();
    if (url || alt) images.push({ url, alt });
  }

  const parsed = productSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    sku: str(fd, "sku"),
    shortDescription: str(fd, "shortDescription"),
    description: str(fd, "description"),
    categoryId: str(fd, "categoryId"),
    priceMinor,
    size: str(fd, "size"),
    ingredients: str(fd, "ingredients"),
    directions: str(fd, "directions"),
    warnings: str(fd, "warnings"),
    storage: str(fd, "storage"),
    stockQuantity: int(fd, "stockQuantity"),
    status: str(fd, "status"),
    isConcept: bool(fd, "isConcept"),
    isDemo: bool(fd, "isDemo"),
    featured: bool(fd, "featured"),
    images,
  });
  if (!parsed.success) return { error: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) };

  const { images: imgs, ...data } = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return { error: "Category not found.", fields: { categoryId: "Choose a category" } };

  let productId = id;
  try {
    if (id) {
      await prisma.$transaction([
        prisma.product.update({ where: { id }, data: { ...data, currency: settings.currency } }),
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.productImage.createMany({ data: imgs.map((im, i) => ({ ...im, productId: id, sortOrder: i })) }),
      ]);
      await audit(admin.id, "product.update", "Product", id, `${data.name} · status=${data.status} · stock=${data.stockQuantity}`);
    } else {
      const created = await prisma.product.create({
        data: { ...data, currency: settings.currency, images: { create: imgs.map((im, i) => ({ ...im, sortOrder: i })) } },
      });
      productId = created.id;
      await audit(admin.id, "product.create", "Product", created.id, data.name);
    }
  } catch (err) {
    const msg = uniqueError(err);
    if (msg) return { error: msg, fields: msg.includes("slug") ? { slug: msg } : msg.includes("SKU") ? { sku: msg } : {} };
    throw err;
  }

  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/products/${productId}?created=1`);
  return { ok: true, message: "Product saved." };
}

export async function archiveProductAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  await prisma.product.update({ where: { id }, data: { status: "archived", featured: false } });
  await audit(admin.id, "product.archive", "Product", id);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function quickStockAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const stock = int(fd, "stockQuantity");
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) return;
  await prisma.product.update({ where: { id }, data: { stockQuantity: stock } });
  await audit(admin.id, "product.stock", "Product", id, `stock=${stock}`);
  revalidatePath("/", "layout");
}

export async function toggleFeaturedAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { featured: !product.featured } });
  await audit(admin.id, "product.featured", "Product", id, `featured=${!product.featured}`);
  revalidatePath("/", "layout");
}

/* ------------------------------- Categories ------------------------------- */

export async function saveCategoryAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const parsed = categorySchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    description: str(fd, "description"),
    sortOrder: int(fd, "sortOrder"),
    active: bool(fd, "active"),
  });
  if (!parsed.success) return { error: "Please correct the fields.", fields: fieldErrors(parsed.error) };
  try {
    if (id) await prisma.category.update({ where: { id }, data: parsed.data });
    else await prisma.category.create({ data: parsed.data });
  } catch (err) {
    const msg = uniqueError(err);
    if (msg) return { error: msg, fields: { slug: msg } };
    throw err;
  }
  await audit(admin.id, id ? "category.update" : "category.create", "Category", id, parsed.data.name);
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Category updated." : "Category created." };
}

/* --------------------------------- Orders --------------------------------- */

export async function updateOrderAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  const paymentStatus = str(fd, "paymentStatus");
  const internalNotes = str(fd, "internalNotes").slice(0, 4000);

  if (!ORDER_STATUSES.some((s) => s.value === status)) return { error: "Invalid status." };
  if (!PAYMENT_STATUSES.some((s) => s.value === paymentStatus)) return { error: "Invalid payment status." };

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { error: "Order not found." };

  const restock = bool(fd, "restock");
  const becomingCancelled = (status === "cancelled" || status === "refunded") && order.status !== "cancelled" && order.status !== "refunded";

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status, paymentStatus, internalNotes } });
    if (becomingCancelled && restock) {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
        }
      }
    }
  });

  const changes = [
    order.status !== status ? `status ${order.status}→${status}` : "",
    order.paymentStatus !== paymentStatus ? `payment ${order.paymentStatus}→${paymentStatus}` : "",
    order.internalNotes !== internalNotes ? "notes updated" : "",
    becomingCancelled && restock ? "stock restored" : "",
  ]
    .filter(Boolean)
    .join(", ");
  await audit(admin.id, "order.update", "Order", id, `${order.reference}: ${changes || "no changes"}`);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Order updated." };
}

/* -------------------------------- Settings -------------------------------- */

export async function saveSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const methods = [];
  for (let i = 0; i < 6; i++) {
    const label = str(fd, `pmLabel${i}`).trim();
    if (!label) continue;
    methods.push({
      id: str(fd, `pmId${i}`).trim() || label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || `method_${i}`,
      label,
      instructions: str(fd, `pmInstructions${i}`),
      enabled: bool(fd, `pmEnabled${i}`),
    });
  }
  const parsed = settingsSchema.safeParse({
    storeName: str(fd, "storeName"),
    currency: str(fd, "currency"),
    contactPhone: str(fd, "contactPhone"),
    whatsappNumber: str(fd, "whatsappNumber"),
    contactEmail: str(fd, "contactEmail"),
    businessAddress: str(fd, "businessAddress"),
    operatingHours: str(fd, "operatingHours"),
    announcement: str(fd, "announcement"),
    pickupEnabled: bool(fd, "pickupEnabled"),
    pickupInstructions: str(fd, "pickupInstructions"),
    lowStockThreshold: int(fd, "lowStockThreshold"),
    instagramUrl: str(fd, "instagramUrl"),
    facebookUrl: str(fd, "facebookUrl"),
    linkedinUrl: str(fd, "linkedinUrl"),
    paymentMethods: methods,
  });
  if (!parsed.success) return { error: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) };
  const { paymentMethods, ...rest } = parsed.data;
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: { ...rest, paymentMethods: JSON.stringify(paymentMethods) },
    create: { id: 1, ...rest, paymentMethods: JSON.stringify(paymentMethods) },
  });
  await audit(admin.id, "settings.update", "StoreSettings", "1");
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

export async function saveZoneAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const settings = await getSettings();
  const feeMinor = parseMoneyInput(str(fd, "fee"), settings.currency);
  if (feeMinor === null) return { error: "Enter a valid fee.", fields: { feeMinor: "Enter a valid fee" } };
  const parsed = deliveryZoneSchema.safeParse({
    name: str(fd, "name"),
    feeMinor,
    eta: str(fd, "eta"),
    active: bool(fd, "active"),
    sortOrder: int(fd, "sortOrder"),
  });
  if (!parsed.success) return { error: "Please correct the fields.", fields: fieldErrors(parsed.error) };
  if (id) await prisma.deliveryZone.update({ where: { id }, data: parsed.data });
  else await prisma.deliveryZone.create({ data: parsed.data });
  await audit(admin.id, id ? "zone.update" : "zone.create", "DeliveryZone", id, parsed.data.name);
  revalidatePath("/", "layout");
  return { ok: true, message: "Delivery area saved." };
}

export async function deleteZoneAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  await prisma.deliveryZone.delete({ where: { id } });
  await audit(admin.id, "zone.delete", "DeliveryZone", id);
  revalidatePath("/", "layout");
}

/* -------------------------------- Messages -------------------------------- */

export async function toggleMessageHandledAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) return;
  await prisma.contactMessage.update({ where: { id }, data: { handled: !msg.handled } });
  revalidatePath("/admin/messages");
}

export async function deleteSubscriberAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  await prisma.newsletterSubscriber.delete({ where: { id } });
  await audit(admin.id, "subscriber.delete", "NewsletterSubscriber", id);
  revalidatePath("/admin/messages");
}
