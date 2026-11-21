import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { orderStatusLabel } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";
import { StatusPill } from "../../status-pill";
import { OrderUpdateForm } from "./order-update-form";

export const metadata: Metadata = { title: "Order" };

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const history = await prisma.auditLog.findMany({
    where: { entity: "Order", entityId: order.id },
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } } },
    take: 20,
  });
  const wa = whatsappLink(order.phone, `Hello ${order.customerName}, this is JADOS about your order ${order.reference}.`);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-forest underline">← Orders</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold text-forest sm:text-3xl">{order.reference}</h1>
        <StatusPill status={order.status} label={orderStatusLabel(order.status)} />
        <StatusPill status={order.paymentStatus} />
        {order.isDemo && <span className="rounded bg-gold/25 px-2 py-0.5 text-xs">demo order</span>}
      </div>
      <p className="mt-1 text-sm text-muted">Placed {order.createdAt.toLocaleString("en-GB")}</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold text-forest">Items</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr>
                  <th scope="col" className="py-2">Product (snapshot)</th>
                  <th scope="col" className="py-2">SKU</th>
                  <th scope="col" className="py-2 text-right">Unit</th>
                  <th scope="col" className="py-2 text-right">Qty</th>
                  <th scope="col" className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2">{i.productName}</td>
                    <td className="py-2 font-mono text-xs">{i.sku}</td>
                    <td className="py-2 text-right">{formatMoney(i.unitPriceMinor, order.currency)}</td>
                    <td className="py-2 text-right">{i.quantity}</td>
                    <td className="py-2 text-right">{formatMoney(i.lineTotalMinor, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line">
                <tr><td colSpan={4} className="pt-2 text-right">Subtotal</td><td className="pt-2 text-right">{formatMoney(order.subtotalMinor, order.currency)}</td></tr>
                <tr><td colSpan={4} className="text-right">Delivery</td><td className="text-right">{formatMoney(order.deliveryFeeMinor, order.currency)}</td></tr>
                <tr className="font-semibold"><td colSpan={4} className="text-right">Total</td><td className="text-right">{formatMoney(order.totalMinor, order.currency)}</td></tr>
              </tfoot>
            </table>
          </section>

          <section className="card grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <h2 className="font-semibold text-forest">Customer</h2>
              <dl className="mt-2 space-y-1 text-sm">
                <div><dt className="inline text-muted">Name: </dt><dd className="inline">{order.customerName}</dd></div>
                <div><dt className="inline text-muted">Phone: </dt><dd className="inline"><a href={`tel:${order.phone.replace(/\s/g, "")}`} className="underline">{order.phone}</a></dd></div>
                <div><dt className="inline text-muted">Email: </dt><dd className="inline">{order.email || "—"}</dd></div>
              </dl>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-forest underline">Message on WhatsApp ↗</a>}
            </div>
            <div>
              <h2 className="font-semibold text-forest">Fulfilment</h2>
              <dl className="mt-2 space-y-1 text-sm">
                <div><dt className="inline text-muted">Method: </dt><dd className="inline capitalize">{order.fulfilmentMethod}</dd></div>
                {order.fulfilmentMethod === "delivery" && (
                  <>
                    <div><dt className="inline text-muted">Area: </dt><dd className="inline">{order.deliveryZoneName}</dd></div>
                    <div><dt className="inline text-muted">Address: </dt><dd className="inline">{order.address}</dd></div>
                    <div><dt className="inline text-muted">City/district: </dt><dd className="inline">{order.city}</dd></div>
                  </>
                )}
                <div><dt className="inline text-muted">Payment method: </dt><dd className="inline">{order.paymentMethod}</dd></div>
                <div><dt className="inline text-muted">Customer notes: </dt><dd className="inline">{order.notes || "—"}</dd></div>
              </dl>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold text-forest">History</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No admin changes yet.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {history.map((h) => (
                  <li key={h.id}>
                    <span className="text-muted">{h.createdAt.toLocaleString("en-GB")}</span> — {h.admin?.name ?? "system"}: {h.details}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <OrderUpdateForm order={{ id: order.id, status: order.status, paymentStatus: order.paymentStatus, internalNotes: order.internalNotes }} />
      </div>
    </div>
  );
}
