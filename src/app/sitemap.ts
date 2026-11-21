import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticPages = ["", "/shop", "/about", "/our-impact", "/contact", "/faq", "/shipping-returns", "/privacy", "/terms"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
  ];
}
