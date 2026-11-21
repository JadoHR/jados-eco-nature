import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { minorToInput } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { deleteZoneAction } from "../../actions";
import { SettingsForm } from "./settings-form";
import { ZoneForm } from "./zone-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, zones] = await Promise.all([getSettings(), prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } })]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-forest">Store settings</h1>
        <p className="mt-2 text-sm text-muted">Contact details, payment options and announcements shown across the store. Leave a field empty to hide it.</p>
        <div className="mt-6">
          <SettingsForm
            settings={{
              storeName: settings.storeName,
              currency: settings.currency,
              contactPhone: settings.contactPhone,
              whatsappNumber: settings.whatsappNumber,
              contactEmail: settings.contactEmail,
              businessAddress: settings.businessAddress,
              operatingHours: settings.operatingHours,
              announcement: settings.announcement,
              pickupEnabled: settings.pickupEnabled,
              pickupInstructions: settings.pickupInstructions,
              lowStockThreshold: settings.lowStockThreshold,
              instagramUrl: settings.instagramUrl,
              facebookUrl: settings.facebookUrl,
              linkedinUrl: settings.linkedinUrl,
              paymentMethods: settings.paymentMethodList,
            }}
          />
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl text-forest">Delivery areas &amp; fees</h2>
        <p className="mt-1 text-sm text-muted">Customers choose one of the active areas at checkout. Fees are in {settings.currency}.</p>
        <div className="mt-4 space-y-3">
          {zones.map((z) => (
            <div key={z.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="flex-1">
                <ZoneForm zone={{ id: z.id, name: z.name, fee: minorToInput(z.feeMinor, settings.currency), eta: z.eta, active: z.active, sortOrder: z.sortOrder }} />
              </div>
              <form action={deleteZoneAction}>
                <input type="hidden" name="id" value={z.id} />
                <button className="rounded-full border border-red-300 px-3 py-2 text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950">Delete</button>
              </form>
            </div>
          ))}
          <h3 className="pt-2 font-semibold text-forest">Add a delivery area</h3>
          <ZoneForm />
        </div>
      </section>
    </div>
  );
}
