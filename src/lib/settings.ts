import { cache } from "react";
import { prisma } from "./db";

export type PaymentMethod = { id: string; label: string; instructions: string; enabled: boolean };

export function parsePaymentMethods(json: string): PaymentMethod[] {
  try {
    const value = JSON.parse(json);
    if (!Array.isArray(value)) return [];
    return value
      .filter((m) => m && typeof m.id === "string" && typeof m.label === "string")
      .map((m) => ({
        id: String(m.id),
        label: String(m.label),
        instructions: String(m.instructions ?? ""),
        enabled: Boolean(m.enabled),
      }));
  } catch {
    return [];
  }
}

/** Store settings singleton (created with defaults if missing). Cached per request. */
export const getSettings = cache(async () => {
  const settings =
    (await prisma.storeSettings.findUnique({ where: { id: 1 } })) ??
    (await prisma.storeSettings.create({ data: { id: 1 } }));
  return { ...settings, paymentMethodList: parsePaymentMethods(settings.paymentMethods) };
});

export type Settings = Awaited<ReturnType<typeof getSettings>>;

/** Public, non-sensitive subset safe to pass to client components. */
export function publicSettings(s: Settings) {
  return {
    storeName: s.storeName,
    currency: s.currency,
    contactPhone: s.contactPhone,
    whatsappNumber: s.whatsappNumber,
    contactEmail: s.contactEmail,
    announcement: s.announcement,
  };
}
export type PublicSettings = ReturnType<typeof publicSettings>;
