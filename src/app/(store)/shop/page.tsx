import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogView, firstParam, parseSort } from "@/components/catalog-view";
import { getCategories, getProducts } from "@/lib/catalog";
import { allowDemoOrders } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Honey, beeswax candles and nature-inspired products from JADOS ECO-NATURE INDUSTRIES, Rwanda.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const sort = parseSort(sp.sort);
  const [categories, products] = await Promise.all([getCategories(), getProducts({ q, sort })]);

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">Shop</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Honey and beeswax products from Rwandan beekeeping, plus a botanical skincare collection we are developing carefully.
      </p>
      <CatalogView products={products} categories={categories} q={q} sort={sort} allowDemo={allowDemoOrders()} basePath="/shop" />
    </div>
  );
}
