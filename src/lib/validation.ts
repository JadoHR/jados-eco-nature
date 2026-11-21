import { z } from "zod";
import { MAX_QTY_PER_LINE } from "./pricing";

const trimmed = (max: number) => z.string().trim().max(max);

/** Accepts Rwandan / East African style phone numbers: optional +, 9–15 digits, spaces/dashes allowed. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((v) => /^\+?[\d\s\-()]{9,20}$/.test(v) && v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15, {
    message: "Enter a valid phone number, e.g. +250 7XX XXX XXX",
  });

export const cartItemsSchema = z
  .array(
    z.object({
      productId: z.string().trim().min(1).max(64),
      quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
    }),
  )
  .min(1, "Your cart is empty")
  .max(50);

export const checkoutSchema = z
  .object({
    idempotencyKey: z.string().trim().min(16).max(80),
    items: cartItemsSchema,
    customerName: trimmed(100).min(2, "Please enter your full name"),
    phone: phoneSchema,
    email: z
      .string()
      .trim()
      .max(160)
      .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email or leave it empty"),
    fulfilmentMethod: z.enum(["delivery", "pickup"]),
    deliveryZoneId: trimmed(64).optional().default(""),
    address: trimmed(300).optional().default(""),
    city: trimmed(100).optional().default(""),
    notes: trimmed(500).optional().default(""),
    paymentMethod: trimmed(64).min(1, "Choose a payment method"),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please confirm you have read the order terms" }) }),
  })
  .superRefine((v, ctx) => {
    if (v.fulfilmentMethod === "delivery") {
      if (!v.deliveryZoneId) ctx.addIssue({ code: "custom", path: ["deliveryZoneId"], message: "Choose a delivery area" });
      if (v.address.length < 5) ctx.addIssue({ code: "custom", path: ["address"], message: "Enter a delivery address" });
      if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your city or district" });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const quoteSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().trim().min(1).max(64), quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
    .max(50),
  fulfilmentMethod: z.enum(["delivery", "pickup"]).optional(),
  deliveryZoneId: z.string().trim().max(64).optional(),
});

export const contactSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name"),
  contact: trimmed(160).min(5, "Enter an email or phone number so we can reply"),
  topic: z.enum(["general", "order", "wholesale", "partnership"]),
  message: trimmed(2000).min(10, "Please write a short message (at least 10 characters)"),
  website: z.string().max(0).optional().default(""), // honeypot — must stay empty
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(160),
  consent: z.literal(true, { errorMap: () => ({ message: "Please tick the consent box" }) }),
  website: z.string().max(0).optional().default(""),
});

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

export const productSchema = z.object({
  name: trimmed(120).min(2),
  slug: slugSchema,
  sku: trimmed(40).min(2).regex(/^[A-Za-z0-9\-_]+$/, "SKU: letters, numbers, dash or underscore"),
  shortDescription: trimmed(240).min(5),
  description: trimmed(5000).min(10),
  categoryId: trimmed(64).min(1, "Choose a category"),
  priceMinor: z.number().int().min(0).max(1_000_000_000),
  size: trimmed(60),
  ingredients: trimmed(2000),
  directions: trimmed(2000),
  warnings: trimmed(2000),
  storage: trimmed(1000),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  status: z.enum(["draft", "published", "archived"]),
  isConcept: z.boolean(),
  isDemo: z.boolean(),
  featured: z.boolean(),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .max(500)
          .refine((u) => u.startsWith("/") || /^https:\/\//.test(u), "Image URL must start with / or https://"),
        alt: trimmed(200).min(3, "Describe the image (alt text)"),
      }),
    )
    .max(6),
});

export const categorySchema = z.object({
  name: trimmed(80).min(2),
  slug: slugSchema,
  description: trimmed(500),
  sortOrder: z.number().int().min(0).max(1000),
  active: z.boolean(),
});

export const settingsSchema = z.object({
  storeName: trimmed(120).min(2),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code"),
  contactPhone: trimmed(40),
  whatsappNumber: trimmed(40).refine((v) => v === "" || /^\+?\d[\d\s]{7,18}$/.test(v), "International format, e.g. +2507XXXXXXXX"),
  contactEmail: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email"),
  businessAddress: trimmed(300),
  operatingHours: trimmed(200),
  announcement: trimmed(200),
  pickupEnabled: z.boolean(),
  pickupInstructions: trimmed(500),
  lowStockThreshold: z.number().int().min(0).max(10000),
  instagramUrl: z.string().trim().max(300).refine((v) => v === "" || /^https:\/\//.test(v), "Must be an https:// link"),
  facebookUrl: z.string().trim().max(300).refine((v) => v === "" || /^https:\/\//.test(v), "Must be an https:// link"),
  linkedinUrl: z.string().trim().max(300).refine((v) => v === "" || /^https:\/\//.test(v), "Must be an https:// link"),
  paymentMethods: z
    .array(
      z.object({
        id: z.string().trim().regex(/^[a-z0-9_]{2,40}$/),
        label: trimmed(80).min(2),
        instructions: trimmed(600),
        enabled: z.boolean(),
      }),
    )
    .max(8),
});

export const deliveryZoneSchema = z.object({
  name: trimmed(80).min(2),
  feeMinor: z.number().int().min(0).max(100_000_000),
  eta: trimmed(80),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(1000),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(1).max(200),
});

/** Flatten zod errors into { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
