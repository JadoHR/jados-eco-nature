import Link from "next/link";
import Image from "next/image";
import { HoneycombBackground } from "@/components/honeycomb-background";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { getCategories, getFeaturedProducts, CATEGORY_ART } from "@/lib/catalog";
import { allowDemoOrders } from "@/lib/config";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(4)]);
  const allowDemo = allowDemoOrders();

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <HoneycombBackground />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <p className="eyebrow">Beekeeping &amp; botanicals · Rwanda &amp; East Africa</p>
            <h1 className="heading-display mt-4 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Nature. Science. <span className="text-gold">Rwanda.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/85">
              Discover nature-inspired products made with care, thoughtful ingredients and a commitment to responsible sourcing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary h-12 px-7 text-base">
                Shop Products
              </Link>
              <Link href="/about" className="btn-secondary h-12 px-7 text-base">
                Discover Our Story
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">From Nature to Innovation — Creating Value, Preserving Life.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gold/15 blur-2xl" aria-hidden="true" />
            <div className="card relative overflow-hidden rounded-[2.5rem] p-3 shadow-xl shadow-forest/10">
              <Image
                src="/images/concept/honey-jar-large.svg"
                alt="Concept illustration of a JADOS honey jar with a wooden dipper"
                width={600}
                height={600}
                priority
                unoptimized
                className="h-auto w-full rounded-[2rem]"
              />
              <span className="absolute bottom-6 left-6 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
                Concept illustration
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="cat-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Explore</p>
            <h2 id="cat-heading" className="heading-display mt-2 text-3xl sm:text-4xl">
              Shop by category
            </h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-forest underline decoration-gold underline-offset-4">
            View all products
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/category/${c.slug}`} className="card group block overflow-hidden text-center transition-shadow hover:shadow-md">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={CATEGORY_ART[c.slug] ?? "/images/concept/gift-set.svg"}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width:1024px) 20vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="block px-3 py-3 font-display text-base text-forest">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured products */}
      <section className="border-y border-line bg-cream/60 py-16 sm:py-20" aria-labelledby="featured-heading">
        <div className="container-page">
          <p className="eyebrow">Featured</p>
          <h2 id="featured-heading" className="heading-display mt-2 text-3xl sm:text-4xl">
            From the hive and the garden
          </h2>
          {featured.length === 0 ? (
            <p className="mt-6 text-muted">Products will appear here soon.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} allowDemo={allowDemo} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand story */}
      <section className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center" aria-labelledby="story-heading">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">Our story</p>
          <h2 id="story-heading" className="heading-display mt-2 text-3xl sm:text-4xl">
            It starts with the bees
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/85">
            <p>
              JADOS ECO-NATURE INDUSTRIES is a young Rwandan venture built on a simple idea: healthy bees, careful hands and honest
              product development can turn renewable natural resources into things people genuinely love to use.
            </p>
            <p>
              Our ambition is to connect beekeeping — honey, beeswax and, in time, propolis — with locally available botanicals such as
              green tea, and to develop each product responsibly before it reaches you.
            </p>
          </div>
          <Link href="/about" className="btn-secondary mt-8">
            Read the full story
          </Link>
        </div>
        <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
          {[
            { k: "Beekeeping", v: "Honey, beeswax and propolis as the foundation of the product range." },
            { k: "Botanicals", v: "Green tea, moringa, aloe and other suitable local ingredients — sourcing under evaluation." },
            { k: "Product science", v: "Formulation, testing and packaging done carefully before anything is sold." },
            { k: "Community", v: "Fair partnerships with beekeepers and growers as the business grows." },
          ].map((item) => (
            <div key={item.k} className="card p-5">
              <h3 className="font-display text-lg text-forest">{item.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inspired by Rwanda */}
      <section className="relative overflow-hidden bg-forest py-16 text-on-forest sm:py-24" aria-labelledby="rwanda-heading">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Inspired by Rwanda&apos;s natural resources</p>
            <h2 id="rwanda-heading" className="mt-3 font-display text-3xl sm:text-4xl">
              The land of a thousand hills — and countless flowers
            </h2>
          </div>
          <div className="space-y-4 text-lg leading-relaxed opacity-90">
            <p>
              Rwanda&apos;s hills, wetlands and farms support a remarkable diversity of flowering plants. We are inspired by that
              richness and by the long tradition of beekeeping across East Africa.
            </p>
            <p>
              Where a product is genuinely made or processed in Rwanda, we will say so — together with where its ingredients come from.
              Where we work with partner beekeepers or suppliers, we will say that too.
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="container-page py-16 sm:py-24" aria-labelledby="impact-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">Sustainability &amp; community</p>
          <h2 id="impact-heading" className="heading-display mt-2 text-3xl sm:text-4xl">
            Growing carefully, not quickly
          </h2>
          <p className="mt-4 text-lg text-ink/85">
            We are at the beginning of our journey. These are the commitments that guide how we intend to build JADOS — we will report
            progress honestly as it happens.
          </p>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Responsible sourcing", "Know where every ingredient comes from and work with partners who treat bees and land well."],
            ["Quality & safety first", "No product is sold until its formulation, labelling and required approvals are in place."],
            ["Honest claims", "No medical promises, no “chemical-free” slogans, no unverified certifications."],
            ["Local livelihoods", "Fair, long-term partnerships with beekeepers and growers in Rwanda and the region."],
            ["Less waste", "Reusable or recyclable packaging wherever practical, and efficient use of every resource."],
            ["Keep learning", "Research, test and improve — from hive management to packaging design."],
          ].map(([title, body]) => (
            <li key={title} className="card p-6">
              <span className="mb-3 inline-block h-1.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <h3 className="font-semibold text-forest">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ul>
        <Link href="/our-impact" className="mt-8 inline-block text-sm font-semibold text-forest underline decoration-gold underline-offset-4">
          Our approach to impact
        </Link>
      </section>

      {/* Newsletter */}
      <section className="container-page" aria-labelledby="newsletter-heading">
        <div className="card grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 id="newsletter-heading" className="heading-display text-2xl sm:text-3xl">
              Be first to hear about new harvests
            </h2>
            <p className="mt-3 text-muted">
              Occasional emails about product launches and seasonal honey. No spam — unsubscribe any time by replying to any email.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
