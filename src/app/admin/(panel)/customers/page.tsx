import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Customers" };

/**
 * Customers are derived from orders (there are no customer accounts).
 * Privacy: visible to signed-in admins only, phone numbers partly masked unless revealed.
 */
export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const { reveal } = await searchParams;
  const settings = await getSettings();
  const groups = await prisma.order.groupBy({
    by: ["phone"],
    _count: { _all: true },
    _sum: { totalMinor: true },
    _max: { createdAt: true, customerName: true },
    where: { status: { notIn: ["cancelled"] } },
    orderBy: { _max: { createdAt: "desc" } },
    take: 500,
  });
  const mask = (p: string) => (reveal ? p : p.length > 4 ? `${"•".repeat(p.length - 4)}${p.slice(-4)}` : p);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-forest">Customers</h1>
        <Link href={reveal ? "/admin/customers" : "/admin/customers?reveal=1"} className="btn-secondary">
          {reveal ? "Mask phone numbers" : "Reveal phone numbers"}
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        Grouped by phone number from non-cancelled orders. Only use this data to fulfil and support orders. Delete customer data on
        request (see privacy policy).
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-cream">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="p-3">Name (latest)</th>
              <th scope="col" className="p-3">Phone</th>
              <th scope="col" className="p-3">Orders</th>
              <th scope="col" className="p-3">Total value</th>
              <th scope="col" className="p-3">Last order</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted">No customers yet.</td></tr>}
            {groups.map((g) => (
              <tr key={g.phone} className="border-b border-line last:border-0">
                <td className="p-3">{g._max.customerName}</td>
                <td className="p-3 font-mono">
                  <Link href={`/admin/orders?q=${encodeURIComponent(g.phone)}`} className="underline">{mask(g.phone)}</Link>
                </td>
                <td className="p-3">{g._count._all}</td>
                <td className="p-3">{formatMoney(g._sum.totalMinor ?? 0, settings.currency)}</td>
                <td className="p-3">{g._max.createdAt?.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
