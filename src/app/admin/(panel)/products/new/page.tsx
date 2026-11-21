import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, settings] = await Promise.all([prisma.category.findMany({ orderBy: { sortOrder: "asc" } }), getSettings()]);
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-forest underline">← Products</Link>
      <h1 className="mt-2 font-display text-3xl text-forest">New product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} currency={settings.currency} />
      </div>
    </div>
  );
}
