// Production build used by Vercel (see vercel.json). Requires a Postgres DATABASE_URL.
//  1. swap in the Postgres Prisma schema + migrations (the build machine is throwaway, so this is safe)
//  2. apply pending migrations
//  3. seed demo data ONLY if the store's tables are empty (never overwrites the owner's edits)
//  4. create the first admin if ADMIN_EMAIL + ADMIN_PASSWORD are set and that admin doesn't exist yet
//  5. next build
//
// The store keeps its tables in its own Postgres schema ("jados", see src/lib/db-url.mjs), so it can
// share a database with other apps without reading or changing their tables.
import { execSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";
import { pgSchema } from "./pg-schema.mjs";
import { withStoreSchema } from "../src/lib/db-url.mjs";

if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
  console.error("DATABASE_URL must be a Postgres connection string for production builds (connect a Neon database in Vercel → Storage).");
  process.exit(1);
}
process.env.DATABASE_URL = withStoreSchema(process.env.DATABASE_URL);
process.env.DATABASE_URL_UNPOOLED = withStoreSchema(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);

const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

writeFileSync("prisma/schema.prisma", pgSchema);
rmSync("prisma/migrations", { recursive: true, force: true });
cpSync("prisma/postgres/migrations", "prisma/migrations", { recursive: true });

run("npx prisma generate");
run("npx prisma migrate deploy");
run("npx tsx prisma/seed.ts", { SEED_IF_EMPTY: "1" });
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  // Normally create-only. Set ADMIN_RESET_PASSWORD=1 for one deploy to reset a forgotten password,
  // then remove ADMIN_PASSWORD and ADMIN_RESET_PASSWORD from Vercel again.
  const reset = process.env.ADMIN_RESET_PASSWORD === "1";
  run("npx tsx scripts/create-admin.ts", { ADMIN_CREATE_ONLY: reset ? "0" : "1" });
}
run("npx next build");
