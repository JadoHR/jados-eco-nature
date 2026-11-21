// Production build used by Vercel (see vercel.json). Requires a Postgres DATABASE_URL.
//  1. generate the Postgres Prisma schema + client
//  2. apply pending migrations (prisma/postgres/migrations)
//  3. seed demo data ONLY if the database is empty (never overwrites the owner's edits)
//  4. create the first admin if ADMIN_EMAIL + ADMIN_PASSWORD are set and that admin doesn't exist yet
//  5. next build
import { execSync } from "node:child_process";

if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
  console.error("DATABASE_URL must be a Postgres connection string for production builds (connect a Neon database in Vercel → Storage).");
  process.exit(1);
}
if (!process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;

const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });
const schema = "--schema prisma/postgres/schema.prisma";

run("node scripts/pg-schema.mjs");
run(`npx prisma generate ${schema}`);
run(`npx prisma migrate deploy ${schema}`);
run("npx tsx prisma/seed.ts", { SEED_IF_EMPTY: "1" });
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  run("npx tsx scripts/create-admin.ts", { ADMIN_CREATE_ONLY: "1" });
}
run("npx next build");
