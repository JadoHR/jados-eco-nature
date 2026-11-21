type BadgeProduct = { isConcept: boolean; isDemo: boolean; stockQuantity: number; status: string };

export function availabilityOf(p: BadgeProduct, allowDemo: boolean) {
  if (p.isConcept) return { purchasable: false, label: "Concept — in development" };
  if (p.isDemo && !allowDemo) return { purchasable: false, label: "Coming soon" };
  if (p.status !== "published") return { purchasable: false, label: "Unavailable" };
  if (p.stockQuantity <= 0) return { purchasable: false, label: "Out of stock" };
  if (p.stockQuantity <= 5) return { purchasable: true, label: `Only ${p.stockQuantity} left` };
  return { purchasable: true, label: "In stock" };
}

export function ProductBadges({ product }: { product: BadgeProduct }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {product.isConcept && (
        <span className="rounded-full bg-sage/20 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-botanical">
          Concept · not for sale
        </span>
      )}
      {product.isDemo && !product.isConcept && (
        <span className="rounded-full bg-gold/25 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[#7a5a0c] dark:text-gold">
          Demo listing
        </span>
      )}
      {!product.isConcept && product.stockQuantity <= 0 && (
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-red-800 dark:bg-red-900/40 dark:text-red-200">
          Out of stock
        </span>
      )}
    </div>
  );
}
