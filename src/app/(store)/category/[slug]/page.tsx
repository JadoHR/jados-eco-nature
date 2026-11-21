import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogView, firstParam, parseSort } from "@/components/catalog-view";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/catalog";
import { allowDemoOrders } from "@/lib/config";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return { title: category.name, description: category.description || `${category.name} from JADOS ECO-NATURE INDUSTRIES.` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const q = firstParam(sp.q);
  const sort = parseSort(sp.sort);
  const [categories, products] = await Promise.all([getCategories(), getProducts({ q, sort, category: slug })]);

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]} />
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">{category.name}</h1>
      {category.description && <p className="mt-3 max-w-2xl text-muted">{category.description}</p>}
      {slug === "skincare" && (
        <div className="card mt-6 border-sage/60 bg-sage/10 p-4 text-sm text-ink/85" role="note">
          <strong className="text-forest">In development.</strong> These skincare products are concepts. Formulation, safety and
          stability testing, compliant labelling and any required Rwanda regulatory approvals will be completed before any of them
          are offered for sale.
        </div>
      )}
      <CatalogView
        products={products}
        categories={categories}
        activeCategory={slug}
        q={q}
        sort={sort}
        allowDemo={allowDemoOrders()}
        basePath={`/category/${slug}`}
      />
    </div>
  );
}
