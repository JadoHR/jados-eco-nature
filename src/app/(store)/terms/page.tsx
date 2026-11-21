import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return (
    <ContentPage title="Terms & conditions" eyebrow="Policies" legalReview>
      <p><em>Last updated: [date to be set at launch]</em></p>

      <h2>1. About these terms</h2>
      <p>These terms apply to orders placed through this website operated by JADOS ECO-NATURE INDUSTRIES. [Insert legal entity
        details.]</p>

      <h2>2. Orders</h2>
      <p>Submitting the checkout form sends us an order request. A contract is formed only when we confirm your order with you. We may
        decline an order, for example if a product is unavailable or a price was displayed in error.</p>

      <h2>3. Prices and payment</h2>
      <p>Prices are shown in the store currency and include [state whether VAT/taxes are included]. Delivery fees are shown at
        checkout. Payment is arranged when we confirm your order; no payment is taken on this website.</p>

      <h2>4. Product information</h2>
      <p>We work to describe our products accurately. Products marked “concept” or “demo” are not for sale. Product images may be
        illustrations until real photography is available. Always read the product label before use.</p>

      <h2>5. Delivery, returns and refunds</h2>
      <p>See our Delivery, returns &amp; refunds page.</p>

      <h2>6. Liability</h2>
      <p>[To be completed with legal advice.]</p>

      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of the Republic of Rwanda. [Confirm with legal advice.]</p>
    </ContentPage>
  );
}
