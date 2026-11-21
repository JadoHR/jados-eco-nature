import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [settings, zones] = await Promise.all([
    getSettings(),
    prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const paymentMethods = settings.paymentMethodList.filter((m) => m.enabled);

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">Checkout</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Submitting this form sends us an <strong className="text-ink">order request</strong>. We will contact you to confirm
        availability, delivery and payment. No payment is taken on this website.
      </p>
      <CheckoutForm
        zones={zones.map((z) => ({ id: z.id, name: z.name, feeMinor: z.feeMinor, eta: z.eta }))}
        paymentMethods={paymentMethods}
        pickupEnabled={settings.pickupEnabled}
        pickupInstructions={settings.pickupInstructions}
        currency={settings.currency}
      />
    </div>
  );
}
