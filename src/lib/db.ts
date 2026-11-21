import { PrismaClient } from "@prisma/client";
import { withStoreSchema } from "./db-url.mjs";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: withStoreSchema(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const isPostgres = /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "");

/**
 * Case-insensitive "contains" filter that works on both databases:
 * SQLite (local) is already case-insensitive for ASCII; Postgres (production) needs mode "insensitive".
 */
export function containsText(q: string): { contains: string } {
  return (isPostgres ? { contains: q, mode: "insensitive" } : { contains: q }) as { contains: string };
}
