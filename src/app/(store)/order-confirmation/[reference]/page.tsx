import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { tokensMatch } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { orderStatusLabel } from "@/lib/config";
import { WhatsAppIcon } from "@/components/whatsapp-button";

export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { reference } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";

  const order = await prisma.order.findUnique({ where: { reference }, include: { items: true } });
  // Without the private token we reveal nothing — not even whether the reference exists.
  if (!order || !token || !tokensMatch(order.accessToken, token)) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="heading-display text-3xl">Order not found</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          This confirmation link is invalid or incomplete. If you placed an order, please contact us with your order reference.
        </p>
        <Link href="/contact" className="btn-primary mt-8">
          Contact us
        </Link>
      </div>
    );
  }

  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsappNumber, `Hello JADOS, I have a question about my order ${order.reference}.`);
  const paymentInfo = settings.paymentMethodList.find((m) => m.label === order.paymentMethod);

  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-on-forest" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 className="heading-display mt-6 text-3xl sm:text-4xl">Thank you — we have received your order request</h1>
        <p className="mt-3 text-muted">
          Order reference: <strong className="font-mono text-lg text-ink">{order.reference}</strong>
        </p>
        {order.isDemo && <p className="mt-2 text-sm font-medium text-[#7a4b12] dark:text-gold">This is a test order placed on the demo store.</p>}
      </div>

      <div className="card mt-10 p-6 sm:p-8">
        <h2 className="font-display text-xl text-forest">What happens next</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink/85">
          <li>We will call or message you on <strong>{maskPhone(order.phone)}</strong> to confirm your order.</li>
          <li>We confirm availability, the delivery or pickup arrangement and how to pay.</li>
          <li>Your order is prepared and {order.fulfilmentMethod === "pickup" ? "made ready for pickup" : "dispatched"}.</li>
        </ol>
        <p className="mt-4 rounded-xl bg-gold/15 p-3 text-sm">
          <strong>Payment status: unpaid.</strong> No payment has been taken.{" "}
          {paymentInfo?.instructions ?? "We will share payment details when we confirm your order."}
        </p>
        <p className="mt-3 text-sm text-muted">Current status: {orderStatusLabel(order.status)}</p>
      </div>

      <div className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-xl text-forest">Order summary</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2.5">
              <span>
                {i.productName} <span className="text-muted">× {i.quantity}</span>
              </span>
              <span className="font-medium">{formatMoney(i.lineTotalMinor, order.currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotalMinor, order.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{order.fulfilmentMethod === "pickup" ? "Pickup" : `Delivery (${order.deliveryZoneName})`}</dt>
            <dd>{formatMoney(order.deliveryFeeMinor, order.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatMoney(order.totalMinor, order.currency)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Payment method: {order.paymentMethod} · {order.fulfilmentMethod === "pickup" ? "Pickup" : "Delivery"}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#1f7a4d] text-white hover:bg-[#186640]">
            <WhatsAppIcon size={18} /> Ask about this order
          </a>
        )}
        <Link href="/contact" className="btn-secondary">
          Contact us
        </Link>
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
      </div>
      <p className="mt-6 text-center text-xs text-muted">Keep this page&apos;s link or your order reference — you will need it if you contact us.</p>
    </div>
  );
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\s/g, "");
  return digits.length > 4 ? `${"•".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : digits;
}
