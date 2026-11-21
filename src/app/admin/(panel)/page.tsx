import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { orderStatusLabel } from "@/lib/config";
import { StatusPill } from "./status-pill";

export default async function DashboardPage() {
  await requireAdmin();
  const settings = await getSettings();
  const [orderCount, pendingCount, valueAgg, paidAgg, lowStock, recent, newMessages] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending_confirmation" } }),
    prisma.order.aggregate({ _sum: { totalMinor: true }, where: { status: { notIn: ["cancelled", "refunded"] } } }),
    prisma.order.aggregate({ _sum: { totalMinor: true }, where: { paymentStatus: "paid" } }),
    prisma.product.findMany({
      where: { status: "published", isConcept: false, stockQuantity: { lte: settings.lowStockThreshold } },
      orderBy: { stockQuantity: "asc" },
      take: 10,
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.contactMessage.count({ where: { handled: false } }),
  ]);

  const cards = [
    { label: "Total orders", value: String(orderCount), href: "/admin/orders" },
    { label: "Pending confirmation", value: String(pendingCount), href: "/admin/orders?status=pending_confirmation", highlight: pendingCount > 0 },
    { label: "Order value (excl. cancelled)", value: formatMoney(valueAgg._sum.totalMinor ?? 0, settings.currency) },
    { label: "Paid (admin-verified)", value: formatMoney(paidAgg._sum.totalMinor ?? 0, settings.currency) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <>
              <p className="text-sm text-muted">{c.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${c.highlight ? "text-[#a25c00] dark:text-gold" : "text-ink"}`}>{c.value}</p>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="card p-5 hover:border-forest">
              {inner}
            </Link>
          ) : (
            <div key={c.label} className="card p-5">
              {inner}
            </div>
          );
        })}
      </div>

      {newMessages > 0 && (
        <p className="card mt-4 p-4 text-sm">
          You have <strong>{newMessages}</strong> unhandled contact message{newMessages === 1 ? "" : "s"}.{" "}
          <Link href="/admin/messages" className="text-forest underline">View messages</Link>
        </p>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-forest underline">All orders</Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {recent.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-medium text-forest underline">{o.reference}</Link>
                  <span className="text-muted">{o.createdAt.toLocaleDateString("en-GB")}</span>
                  <StatusPill status={o.status} label={orderStatusLabel(o.status)} />
                  <span className="font-medium">{formatMoney(o.totalMinor, o.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest">Low stock (≤ {settings.lowStockThreshold})</h2>
            <Link href="/admin/products" className="text-sm text-forest underline">Manage stock</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted">All sellable products are above the threshold.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <Link href={`/admin/products/${p.id}`} className="text-forest underline">{p.name}</Link>
                  <span className={p.stockQuantity === 0 ? "font-semibold text-red-700" : "font-semibold"}>{p.stockQuantity}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
