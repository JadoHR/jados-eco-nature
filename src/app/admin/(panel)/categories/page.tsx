import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CategoryForm } from "./category-form";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Categories</h1>
      <p className="mt-2 text-sm text-muted">Inactive categories (and their products) are hidden from the store.</p>
      <div className="mt-6 space-y-4">
        {categories.map((c) => (
          <CategoryForm key={c.id} category={c} productCount={c._count.products} />
        ))}
        <h2 className="pt-4 font-semibold text-forest">Add a category</h2>
        <CategoryForm />
      </div>
    </div>
  );
}
