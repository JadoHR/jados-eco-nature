import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Delivery, returns & refunds" };

export default async function ShippingReturnsPage() {
  const [settings, zones] = await Promise.all([
    getSettings(),
    prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <ContentPage title="Delivery, returns & refunds" eyebrow="Policies" legalReview>
      <h2>Delivery areas and fees</h2>
      {zones.length === 0 ? (
        <p>Delivery areas will be published here soon. Please contact us to arrange delivery.</p>
      ) : (
        <div className="not-prose overflow-x-auto rounded-2xl border border-line bg-cream">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-3 font-semibold text-forest">Area</th>
                <th scope="col" className="p-3 font-semibold text-forest">Fee</th>
                <th scope="col" className="p-3 font-semibold text-forest">Estimated time</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-line last:border-0">
                  <td className="p-3">{z.name}</td>
                  <td className="p-3">{formatMoney(z.feeMinor, settings.currency)}</td>
                  <td className="p-3">{z.eta || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4">
        Delivery times are estimates and start once we have confirmed your order by phone. We will tell you if anything changes.
      </p>

      <h2>Pickup</h2>
      <p>{settings.pickupEnabled ? settings.pickupInstructions || "Pickup details are shared when we confirm your order." : "Pickup is not currently available."}</p>

      <h2>Order confirmation and payment</h2>
      <p>
        Orders placed on this website are order requests. An order is only accepted once we confirm it with you. We will never mark an
        order as paid until we have verified the payment.
      </p>

      <h2>Returns</h2>
      <p>[To be completed by JADOS] For hygiene and food-safety reasons, opened food and personal-care products generally cannot be
        returned unless they are faulty. If your product arrives damaged or is not what you ordered, contact us within [X] days of
        receiving it with your order reference and a photo.</p>

      <h2>Refunds</h2>
      <p>[To be completed by JADOS] Where a refund is due, it will be made using the original payment method within [X] business days
        of the return being approved. State any delivery-fee refund rules here.</p>

      <h2>Cancellations</h2>
      <p>[To be completed by JADOS] You may cancel your order free of charge before it is dispatched by contacting us with your order
        reference.</p>
    </ContentPage>
  );
}
