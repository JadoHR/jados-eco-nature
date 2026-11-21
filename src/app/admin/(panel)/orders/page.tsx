import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/config";
import { StatusPill } from "../status-pill";

export const metadata: Metadata = { title: "Orders" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function OrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const { status, q } = await searchParams;
  const validStatus = ORDER_STATUSES.some((s) => s.value === status) ? status : undefined;
  const term = q?.trim().slice(0, 60);
  const orders = await prisma.order.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(term ? { OR: [{ reference: { contains: term } }, { customerName: { contains: term } }, { phone: { contains: term } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { items: true } } },
  });

  const exportHref = `/admin/orders/export${validStatus ? `?status=${validStatus}` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-forest">Orders</h1>
        <a href={exportHref} className="btn-secondary">Export CSV</a>
      </div>

      <form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="oq">Search orders</label>
        <input id="oq" name="q" defaultValue={term} placeholder="Reference, name or phone" className="input sm:w-64" />
        <label className="sr-only" htmlFor="os">Status</label>
        <select id="os" name="status" defaultValue={validStatus ?? ""} className="input sm:w-64">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="btn-primary">Filter</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-cream">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="p-3">Reference</th>
              <th scope="col" className="p-3">Date</th>
              <th scope="col" className="p-3">Customer</th>
              <th scope="col" className="p-3">Items</th>
              <th scope="col" className="p-3">Total</th>
              <th scope="col" className="p-3">Status</th>
              <th scope="col" className="p-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted">No orders found.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-medium text-forest underline">{o.reference}</Link>
                  {o.isDemo && <span className="ml-1.5 rounded bg-gold/25 px-1.5 py-0.5 text-xs">demo</span>}
                </td>
                <td className="p-3 whitespace-nowrap">{o.createdAt.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3">{o._count.items}</td>
                <td className="p-3 whitespace-nowrap">{formatMoney(o.totalMinor, o.currency)}</td>
                <td className="p-3"><StatusPill status={o.status} label={orderStatusLabel(o.status)} /></td>
                <td className="p-3"><StatusPill status={o.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
