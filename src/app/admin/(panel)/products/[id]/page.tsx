import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { minorToInput } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { archiveProductAction } from "../../../actions";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditProductPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;
  const [product, categories, settings] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-forest underline">← Products</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-forest">{product.name}</h1>
        <div className="flex gap-2">
          {product.status === "published" && (
            <Link href={`/product/${product.slug}`} target="_blank" className="btn-secondary">View on store ↗</Link>
          )}
          {product.status !== "archived" && (
            <form action={archiveProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <button className="btn border border-red-300 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950">Archive</button>
            </form>
          )}
        </div>
      </div>
      {created && <p className="mt-3 rounded-xl bg-forest/10 p-3 text-sm text-forest" role="status">Product created.</p>}
      <div className="mt-6">
        <ProductForm
          categories={categories}
          currency={settings.currency}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            shortDescription: product.shortDescription,
            description: product.description,
            categoryId: product.categoryId,
            price: minorToInput(product.priceMinor, product.currency),
            size: product.size,
            ingredients: product.ingredients,
            directions: product.directions,
            warnings: product.warnings,
            storage: product.storage,
            stockQuantity: product.stockQuantity,
            status: product.status,
            isConcept: product.isConcept,
            isDemo: product.isDemo,
            featured: product.featured,
            images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
          }}
        />
      </div>
    </div>
  );
}
