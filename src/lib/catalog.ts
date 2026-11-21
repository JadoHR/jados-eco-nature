import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { containsText, prisma } from "./db";

export type SortKey = "featured" | "newest" | "price_asc" | "price_desc";

const productInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type CatalogProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export const getCategories = cache(async () =>
  prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
);

export async function getProducts(opts: { q?: string; category?: string; sort?: SortKey } = {}) {
  const where: Prisma.ProductWhereInput = { status: "published", category: { active: true } };
  if (opts.category) where.category = { slug: opts.category, active: true };
  const q = opts.q?.trim().slice(0, 80);
  if (q) {
    where.OR = [
      { name: containsText(q) },
      { shortDescription: containsText(q) },
      { description: containsText(q) },
      { category: { name: containsText(q) } },
    ];
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    opts.sort === "newest"
      ? [{ createdAt: "desc" }]
      : opts.sort === "price_asc"
        ? [{ isConcept: "asc" }, { priceMinor: "asc" }]
        : opts.sort === "price_desc"
          ? [{ isConcept: "asc" }, { priceMinor: "desc" }]
          : [{ featured: "desc" }, { isConcept: "asc" }, { createdAt: "asc" }];
  return prisma.product.findMany({ where, orderBy, include: productInclude });
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { status: "published", featured: true, category: { active: true } },
    orderBy: [{ isConcept: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: productInclude,
  });
}

export const getProductBySlug = cache(async (slug: string) =>
  prisma.product.findFirst({ where: { slug, status: "published" }, include: productInclude }),
);

export const getCategoryBySlug = cache(async (slug: string) =>
  prisma.category.findFirst({ where: { slug, active: true } }),
);

export const CATEGORY_ART: Record<string, string> = {
  honey: "/images/concept/honey-jar.svg",
  "beeswax-candles": "/images/concept/candle.svg",
  skincare: "/images/concept/serum.svg",
  "oils-fragrance": "/images/concept/oils.svg",
  "gift-sets": "/images/concept/gift-set.svg",
};
