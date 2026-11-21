/**
 * DEMO SEED DATA — every product here is a placeholder.
 * Prices, stock levels and sizes are clearly labelled demo values and MUST be
 * replaced or verified by JADOS before launch. Skincare items are CONCEPTS:
 * they can never be ordered until the founder completes formulation, safety,
 * labelling and Rwanda regulatory work and unticks "Concept" in the admin.
 *
 * Safe to re-run: uses upserts keyed on slug / sku and never touches orders.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TBC = "To be confirmed by JADOS before launch.";

const categories = [
  { slug: "honey", name: "Honey", sortOrder: 1, description: "Honey from Rwandan beekeeping — origin and batch details shown on each product." },
  { slug: "beeswax-candles", name: "Beeswax & Candles", sortOrder: 2, description: "Candles and gifts made with beeswax." },
  { slug: "skincare", name: "Skincare", sortOrder: 3, description: "A proposed botanical skincare collection — in development, not yet for sale." },
  { slug: "oils-fragrance", name: "Oils & Fragrance", sortOrder: 4, description: "Future range: botanical oils and natural-inspired fragrance." },
  { slug: "gift-sets", name: "Gift Sets", sortOrder: 5, description: "Future range: curated gifts for people, hotels and companies." },
];

type SeedProduct = {
  slug: string;
  sku: string;
  name: string;
  category: string;
  priceMinor: number;
  stockQuantity: number;
  size: string;
  shortDescription: string;
  description: string;
  ingredients: string;
  directions: string;
  warnings: string;
  storage: string;
  isConcept: boolean;
  featured: boolean;
  image: string;
  alt: string;
};

const SKINCARE_NOTE =
  "CONCEPT PRODUCT — not for sale. Final formulation, ingredient declaration, stability and safety testing, compliant labelling and any required Rwanda regulatory approvals (e.g. Rwanda FDA / RSB) must be completed before this product can be offered.";

const products: SeedProduct[] = [
  {
    slug: "pure-honey-250g",
    sku: "DEMO-HNY-250",
    name: "Pure Honey — 250 g (demo)",
    category: "honey",
    priceMinor: 5000,
    stockQuantity: 24,
    size: "250 g (demo size)",
    shortDescription: "Demo listing for a 250 g jar of pure honey. Price and stock are placeholders.",
    description:
      "DEMO LISTING. This page shows how a JADOS honey product will be presented. Before launch, replace this text with the real origin (district / apiary or partner beekeepers), harvest season, net weight, batch information and genuine product photos.",
    ingredients: `Honey. ${TBC}`,
    directions: "Use as a spread, in drinks or in cooking.",
    warnings: "Do not give honey to infants under 12 months of age.",
    storage: "Store at room temperature, tightly closed, away from direct sunlight. Natural crystallisation may occur; warm gently to re-liquefy.",
    isConcept: false,
    featured: true,
    image: "/images/concept/honey-jar.svg",
    alt: "Concept illustration of a small glass jar of golden honey with a green JADOS label",
  },
  {
    slug: "pure-honey-500g",
    sku: "DEMO-HNY-500",
    name: "Pure Honey — 500 g (demo)",
    category: "honey",
    priceMinor: 9000,
    stockQuantity: 12,
    size: "500 g (demo size)",
    shortDescription: "Demo listing for a 500 g jar of pure honey. Price and stock are placeholders.",
    description:
      "DEMO LISTING. Larger jar for families and kitchens. Replace with verified origin, net weight, batch details and real photography before launch. Only list this size if it is genuinely available.",
    ingredients: `Honey. ${TBC}`,
    directions: "Use as a spread, in drinks or in cooking.",
    warnings: "Do not give honey to infants under 12 months of age.",
    storage: "Store at room temperature, tightly closed, away from direct sunlight. Natural crystallisation may occur.",
    isConcept: false,
    featured: true,
    image: "/images/concept/honey-jar-large.svg",
    alt: "Concept illustration of a large glass jar of amber honey with a honey dipper",
  },
  {
    slug: "beeswax-candle",
    sku: "DEMO-CNDL-01",
    name: "Beeswax Candle (demo)",
    category: "beeswax-candles",
    priceMinor: 7000,
    stockQuantity: 3,
    size: "Size to be confirmed",
    shortDescription: "Demo listing for a beeswax pillar candle. Wax source, size and burn time to be confirmed.",
    description:
      "DEMO LISTING. State clearly whether the wax is produced by JADOS or sourced from partner beekeepers, the candle dimensions, wick type and a tested burn time before launch.",
    ingredients: `Beeswax, cotton wick. ${TBC}`,
    directions: "Trim the wick before each use. Burn on a heat-resistant surface.",
    warnings: "Never leave a burning candle unattended. Keep away from children, pets, curtains and anything flammable.",
    storage: "Store in a cool, dry place away from direct sunlight.",
    isConcept: false,
    featured: true,
    image: "/images/concept/candle.svg",
    alt: "Concept illustration of a golden beeswax pillar candle with a small flame",
  },
  {
    slug: "green-tea-facial-cleanser",
    sku: "CONCEPT-SKN-CLN",
    name: "Green Tea Facial Cleanser (concept)",
    category: "skincare",
    priceMinor: 0,
    stockQuantity: 0,
    size: "To be confirmed",
    shortDescription: "Proposed gentle daily cleanser inspired by green tea. In development — not for sale.",
    description: SKINCARE_NOTE,
    ingredients: TBC,
    directions: TBC,
    warnings: TBC,
    storage: TBC,
    isConcept: true,
    featured: true,
    image: "/images/concept/cleanser.svg",
    alt: "Concept illustration of a green pump bottle labelled Green Tea Cleanser",
  },
  {
    slug: "green-tea-honey-moisturizer",
    sku: "CONCEPT-SKN-MST",
    name: "Green Tea + Honey Moisturizer (concept)",
    category: "skincare",
    priceMinor: 0,
    stockQuantity: 0,
    size: "To be confirmed",
    shortDescription: "Proposed moisturiser combining green tea and honey. In development — not for sale.",
    description: SKINCARE_NOTE,
    ingredients: TBC,
    directions: TBC,
    warnings: TBC,
    storage: TBC,
    isConcept: true,
    featured: false,
    image: "/images/concept/moisturizer.svg",
    alt: "Concept illustration of a cream jar with a gold lid labelled Green Tea and Honey",
  },
  {
    slug: "green-tea-antioxidant-serum",
    sku: "CONCEPT-SKN-SRM",
    name: "Green Tea Antioxidant Serum (concept)",
    category: "skincare",
    priceMinor: 0,
    stockQuantity: 0,
    size: "To be confirmed",
    shortDescription: "Proposed lightweight serum featuring green tea. In development — not for sale.",
    description: SKINCARE_NOTE,
    ingredients: TBC,
    directions: TBC,
    warnings: TBC,
    storage: TBC,
    isConcept: true,
    featured: false,
    image: "/images/concept/serum.svg",
    alt: "Concept illustration of an amber dropper bottle labelled Green Tea Serum",
  },
  {
    slug: "beeswax-lip-balm",
    sku: "CONCEPT-SKN-LIP",
    name: "Beeswax Lip Balm (concept)",
    category: "skincare",
    priceMinor: 0,
    stockQuantity: 0,
    size: "To be confirmed",
    shortDescription: "Proposed lip balm made with beeswax. In development — not for sale.",
    description: SKINCARE_NOTE,
    ingredients: TBC,
    directions: TBC,
    warnings: TBC,
    storage: TBC,
    isConcept: true,
    featured: false,
    image: "/images/concept/lip-balm.svg",
    alt: "Concept illustration of a small beeswax lip balm tube with a green cap",
  },
  {
    slug: "green-tea-clay-mask",
    sku: "CONCEPT-SKN-MSK",
    name: "Green Tea Clay Mask (concept)",
    category: "skincare",
    priceMinor: 0,
    stockQuantity: 0,
    size: "To be confirmed",
    shortDescription: "Proposed clay mask with green tea. In development — not for sale.",
    description: SKINCARE_NOTE,
    ingredients: TBC,
    directions: TBC,
    warnings: TBC,
    storage: TBC,
    isConcept: true,
    featured: false,
    image: "/images/concept/clay-mask.svg",
    alt: "Concept illustration of an open jar of sage-green clay mask",
  },
];

async function main() {
  // Production builds set SEED_IF_EMPTY=1 so demo data is only added to a brand-new database.
  if (process.env.SEED_IF_EMPTY === "1" && (await prisma.category.count()) > 0) {
    console.log("Database already has data — skipping seed.");
    return;
  }

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: "JADOS ECO-NATURE INDUSTRIES",
      currency: "RWF",
      // Contact details intentionally EMPTY — never invent a phone number or email.
      contactPhone: "",
      whatsappNumber: "",
      contactEmail: "",
      businessAddress: "",
      operatingHours: "",
      announcement: "",
      pickupEnabled: true,
      pickupInstructions: "Pickup location and times will be shared when we confirm your order by phone.",
      lowStockThreshold: 5,
      paymentMethods: JSON.stringify([
        {
          id: "pay_on_delivery",
          label: "Pay on delivery / pickup",
          instructions:
            "Pay when you receive your order. We will call you to confirm the order and the accepted payment options before dispatch.",
          enabled: true,
        },
        {
          id: "mobile_money_manual",
          label: "Mobile Money (manual confirmation)",
          instructions:
            "We will call you to confirm your order and then share official payment details. Please do NOT send money before we have confirmed your order.",
          enabled: true,
        },
      ]),
    },
  });

  const zoneCount = await prisma.deliveryZone.count();
  if (zoneCount === 0) {
    await prisma.deliveryZone.createMany({
      data: [
        { name: "Kigali City (demo fee)", feeMinor: 2000, eta: "1–2 days (to be confirmed)", sortOrder: 1 },
        { name: "Other districts in Rwanda (demo fee)", feeMinor: 5000, eta: "2–5 days (to be confirmed)", sortOrder: 2 },
      ],
    });
  }

  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryIds[c.slug] = row.id;
  }

  for (const p of products) {
    const { category, image, alt, ...data } = p;
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        ...data,
        currency: "RWF",
        status: "published",
        isDemo: true,
        categoryId: categoryIds[category],
        images: { create: [{ url: image, alt, sortOrder: 0 }] },
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} demo/concept products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
