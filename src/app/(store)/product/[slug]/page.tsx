import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductImage } from "@/components/product-image";
import { ProductBadges, availabilityOf } from "@/components/product-badges";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WhatsAppIcon } from "@/components/whatsapp-button";
import { getProductBySlug } from "@/lib/catalog";
import { allowDemoOrders, siteUrl } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0];
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const allowDemo = allowDemoOrders();
  const availability = availabilityOf(product, allowDemo);
  const productUrl = `${siteUrl()}/product/${product.slug}`;
  const waHref = whatsappLink(settings.whatsappNumber, `Hello JADOS, I'd like to ask about "${product.name}": ${productUrl}`);
  const [main, ...rest] = product.images;

  const details = [
    { title: "Size", body: product.size },
    { title: product.category.slug === "beeswax-candles" ? "Materials" : "Ingredients", body: product.ingredients },
    { title: "Directions for use", body: product.directions },
    { title: "Warnings", body: product.warnings },
    { title: "Storage", body: product.storage },
  ].filter((d) => d.body);

  // Structured data only for real (non-demo, non-concept) products with verified information.
  const jsonLd =
    !product.isDemo && !product.isConcept
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          description: product.shortDescription,
          image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${siteUrl()}${i.url}`)),
          brand: { "@type": "Brand", name: "JADOS ECO-NATURE INDUSTRIES" },
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: product.currency,
            price: product.priceMinor,
            availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }
      : null;

  return (
    <div className="container-page py-10 sm:py-14">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category.name, href: `/category/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <ProductImage src={main?.url} alt={main?.alt ?? product.name} className="aspect-square" priority sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
          {rest.length > 0 && (
            <ul className="grid grid-cols-4 gap-3">
              {rest.map((img) => (
                <li key={img.id} className="card overflow-hidden">
                  <ProductImage src={img.url} alt={img.alt} className="aspect-square" sizes="25vw" />
                </li>
              ))}
            </ul>
          )}
          {main?.url.includes("/concept/") && <p className="text-xs text-muted">Image: concept illustration, not a photograph of the final product.</p>}
        </div>

        <div>
          <ProductBadges product={product} />
          <p className="mt-4 text-sm font-medium uppercase tracking-wider text-sage">{product.category.name}</p>
          <h1 className="heading-display mt-1 text-3xl sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg text-ink/85">{product.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            {product.isConcept ? (
              <span className="text-lg font-medium text-muted">Not for sale yet</span>
            ) : (
              <>
                <span className="text-3xl font-semibold text-ink">{formatMoney(product.priceMinor, product.currency)}</span>
                {product.isDemo && <span className="text-sm text-muted">(demo price — to be confirmed)</span>}
              </>
            )}
          </div>
          <p className={`mt-2 text-sm font-medium ${availability.purchasable ? "text-botanical" : "text-muted"}`}>{availability.label}</p>

          <div className="mt-6">
            {availability.purchasable ? (
              <AddToCartButton
                withQuantity
                item={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceMinor: product.priceMinor,
                  currency: product.currency,
                  imageUrl: main?.url ?? null,
                }}
                maxQuantity={product.stockQuantity}
              />
            ) : product.isConcept ? (
              <div className="card border-sage/60 bg-sage/10 p-4 text-sm leading-relaxed" role="note">
                <strong className="text-forest">This is a concept product.</strong> It cannot be ordered until formulation,
                safety testing, labelling and any required approvals are complete. Want to know when it launches? Join our newsletter or
                contact us.
              </div>
            ) : (
              <p className="text-sm text-muted">This product cannot be ordered right now.</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn border border-[#1f7a4d] text-[#1f7a4d] hover:bg-[#1f7a4d]/10 dark:border-[#5fd39a] dark:text-[#5fd39a]">
                <WhatsAppIcon size={18} /> Ask about this product
              </a>
            ) : process.env.NODE_ENV !== "production" ? (
              <span className="btn cursor-default border border-dashed border-sage text-muted" aria-disabled="true">
                [WhatsApp “Ask about this product” — number not configured]
              </span>
            ) : null}
            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <h2 className="font-display text-xl text-forest">About this product</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/85">{product.description}</p>
          </div>

          {details.length > 0 && (
            <dl className="mt-8 divide-y divide-line rounded-2xl border border-line bg-cream">
              {details.map((d) => (
                <div key={d.title} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm font-semibold text-forest">{d.title}</dt>
                  <dd className="whitespace-pre-line text-sm leading-relaxed text-ink/85">{d.body}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 text-xs text-muted">SKU: {product.sku}</p>
        </div>
      </div>
    </div>
  );
}
