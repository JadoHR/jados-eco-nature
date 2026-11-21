import Link from "next/link";
import { ProductImage } from "./product-image";
import { formatMoney } from "@/lib/money";
import type { CatalogProduct } from "@/lib/catalog";
import { AddToCartButton } from "./cart/add-to-cart-button";
import { ProductBadges, availabilityOf } from "./product-badges";

export function ProductCard({ product, allowDemo }: { product: CatalogProduct; allowDemo: boolean }) {
  const image = product.images[0];
  const availability = availabilityOf(product, allowDemo);

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-forest/5">
      <Link href={`/product/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <ProductImage src={image?.url} alt={image?.alt ?? product.name} className="aspect-square transition-transform duration-500 group-hover:scale-[1.02]" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <ProductBadges product={product} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sage">{product.category.name}</p>
          <h3 className="mt-1 font-display text-lg leading-snug text-forest">
            <Link href={`/product/${product.slug}`} className="hover:underline hover:decoration-gold hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {product.isConcept ? (
            <span className="text-sm font-medium text-muted">Not for sale yet</span>
          ) : (
            <span className="font-semibold text-ink">
              {formatMoney(product.priceMinor, product.currency)}
              {product.isDemo && <span className="ml-1 text-xs font-normal text-muted">(demo price)</span>}
            </span>
          )}
          {availability.purchasable ? (
            <AddToCartButton
              compact
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceMinor: product.priceMinor,
                currency: product.currency,
                imageUrl: image?.url ?? null,
              }}
              maxQuantity={product.stockQuantity}
            />
          ) : (
            <Link href={`/product/${product.slug}`} className="text-sm font-semibold text-forest underline decoration-gold underline-offset-4">
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
