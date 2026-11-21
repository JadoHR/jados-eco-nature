import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { quickStockAction, toggleFeaturedAction } from "../../actions";
import { StatusPill } from "../status-pill";

export const metadata: Metadata = { title: "Products" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdmin();
  const { status } = await searchParams;
  const products = await prisma.product.findMany({
    where: status ? { status } : { status: { not: "archived" } },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    include: { category: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-forest">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">+ New product</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {[
          ["", "Active"],
          ["published", "Published"],
          ["draft", "Drafts"],
          ["archived", "Archived"],
        ].map(([v, label]) => (
          <Link key={v} href={v ? `/admin/products?status=${v}` : "/admin/products"} className={`rounded-full border px-3 py-1 ${(status ?? "") === v ? "border-forest bg-forest text-on-forest" : "border-line"}`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-cream">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="p-3">Product</th>
              <th scope="col" className="p-3">Category</th>
              <th scope="col" className="p-3">Price</th>
              <th scope="col" className="p-3">Status</th>
              <th scope="col" className="p-3">Flags</th>
              <th scope="col" className="p-3">Stock</th>
              <th scope="col" className="p-3">Featured</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted">No products.</td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-forest underline">{p.name}</Link>
                  <div className="text-xs text-muted">{p.sku}</div>
                </td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3 whitespace-nowrap">{formatMoney(p.priceMinor, p.currency)}</td>
                <td className="p-3"><StatusPill status={p.status} /></td>
                <td className="p-3 text-xs">
                  {p.isConcept && <span className="mr-1 rounded bg-sage/20 px-1.5 py-0.5">concept</span>}
                  {p.isDemo && <span className="rounded bg-gold/25 px-1.5 py-0.5">demo</span>}
                </td>
                <td className="p-3">
                  <form action={quickStockAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="sr-only" htmlFor={`stock-${p.id}`}>Stock for {p.name}</label>
                    <input id={`stock-${p.id}`} name="stockQuantity" type="number" min={0} defaultValue={p.stockQuantity} className="input w-20 py-1.5" />
                    <button className="rounded-lg border border-line px-2 py-1.5 text-xs hover:border-forest">Save</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={toggleFeaturedAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className={`rounded-full px-3 py-1 text-xs font-semibold ${p.featured ? "bg-gold text-[#1d2a20]" : "border border-line text-muted"}`} aria-pressed={p.featured}>
                      {p.featured ? "★ Featured" : "☆ Feature"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
