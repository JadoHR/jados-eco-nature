import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "FAQ", description: "Frequently asked questions about ordering from JADOS ECO-NATURE INDUSTRIES." };

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I place an order?",
    a: "Add products to your cart, go to checkout and submit your details. You will receive an order reference straight away, and we will contact you by phone to confirm the order, delivery and payment.",
  },
  {
    q: "Do I pay online?",
    a: "Not at the moment. The website records your order request only — no payment is taken and we never ask for card details here. We confirm payment options with you directly when we confirm your order.",
  },
  {
    q: "Where do you deliver?",
    a: (
      <>
        Delivery areas and fees are shown at checkout. Pickup may also be available. See{" "}
        <Link href="/shipping-returns" className="underline">delivery, returns &amp; refunds</Link>.
      </>
    ),
  },
  {
    q: "Is your honey made in Rwanda?",
    a: "Each honey product page states its origin once it has been verified — including whether it comes from JADOS hives or partner beekeepers. If a detail is not shown yet, please ask us.",
  },
  {
    q: "Why does my honey look crystallised?",
    a: "Crystallisation is a natural process in many honeys and does not mean the honey has spoiled. Warming the jar gently in warm (not boiling) water will usually re-liquefy it.",
  },
  {
    q: "Can I give honey to my baby?",
    a: "No. Honey should not be given to infants under 12 months of age.",
  },
  {
    q: "When will the skincare range be available?",
    a: "The skincare products shown are concepts. They will only go on sale after formulation, safety and stability testing, compliant labelling and any required approvals are complete. Join the newsletter to hear when they launch.",
  },
  {
    q: "Do you supply hotels, spas, shops or corporate gifts?",
    a: (
      <>
        Yes, we welcome business enquiries. Please use the{" "}
        <Link href="/contact" className="underline">contact form</Link> and choose “Wholesale”.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <ContentPage title="Frequently asked questions" eyebrow="Help">
      <div className="not-prose space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-forest">
              {f.q}
              <span className="text-xl text-gold transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <div className="mt-3 leading-relaxed text-ink/85">{f.a}</div>
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
