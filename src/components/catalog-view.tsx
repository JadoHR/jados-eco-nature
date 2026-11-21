import Link from "next/link";
import { ProductCard } from "./product-card";
import type { CatalogProduct, SortKey } from "@/lib/catalog";

type Category = { id: string; name: string; slug: string };

/** Shared listing UI for /shop and /category/[slug]. Uses plain GET forms — works without JavaScript. */
export function CatalogView({
  products,
  categories,
  activeCategory,
  q,
  sort,
  allowDemo,
  basePath,
}: {
  products: CatalogProduct[];
  categories: Category[];
  activeCategory?: string;
  q?: string;
  sort: SortKey;
  allowDemo: boolean;
  basePath: string;
}) {
  const qs = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2 whitespace-nowrap">
            <li>
              <Link
                href={`/shop${qs({ q, sort: sort !== "featured" ? sort : undefined })}`}
                aria-current={!activeCategory ? "page" : undefined}
                className={`inline-block rounded-full border px-4 py-2 text-sm font-medium ${!activeCategory ? "border-forest bg-forest text-on-forest" : "border-line bg-cream text-ink hover:border-forest"}`}
              >
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}${qs({ q, sort: sort !== "featured" ? sort : undefined })}`}
                  aria-current={activeCategory === c.slug ? "page" : undefined}
                  className={`inline-block rounded-full border px-4 py-2 text-sm font-medium ${activeCategory === c.slug ? "border-forest bg-forest text-on-forest" : "border-line bg-cream text-ink hover:border-forest"}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form method="get" action={basePath} className="flex flex-col gap-2 sm:flex-row sm:items-center" role="search">
          <label htmlFor="catalog-q" className="sr-only">
            Search
          </label>
          <input id="catalog-q" name="q" type="search" defaultValue={q} placeholder="Search…" className="input sm:w-52" />
          <label htmlFor="catalog-sort" className="sr-only">
            Sort by
          </label>
          <select id="catalog-sort" name="sort" defaultValue={sort} className="input sm:w-48">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <button type="submit" className="btn-primary">
            Apply
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {q ? (
          <>
            {" "}
            matching “<span className="font-medium text-ink">{q}</span>” ·{" "}
            <Link href={basePath} className="underline">
              clear search
            </Link>
          </>
        ) : null}
      </p>

      {products.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <h2 className="font-display text-xl text-forest">No products found</h2>
          <p className="mt-2 text-muted">Try a different search term or browse all products.</p>
          <Link href="/shop" className="btn-primary mt-6">
            View all products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} allowDemo={allowDemo} />
          ))}
        </div>
      )}
    </div>
  );
}

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "newest" || v === "price_asc" || v === "price_desc" ? v : "featured";
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() ? v.trim().slice(0, 80) : undefined;
}
