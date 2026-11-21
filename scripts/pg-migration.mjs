// Creates a Postgres migration for production from changes to prisma/schema.prisma — no database needed.
//
//   npm run db:pg:migration -- add_gift_wrap
//
// It diffs the previous generated Postgres schema (prisma/postgres/schema.prisma) against a fresh
// one generated from prisma/schema.prisma, writes prisma/postgres/migrations/<timestamp>_<name>/migration.sql
// and updates prisma/postgres/schema.prisma. Commit both; Vercel applies it on the next deploy.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pgSchema } from "./pg-schema.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pgDir = path.join(root, "prisma", "postgres");
const schemaPath = path.join(pgDir, "schema.prisma");
const name = (process.argv[2] ?? "").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
if (!name) throw new Error("Usage: npm run db:pg:migration -- <migration_name>");

const prev = existsSync(schemaPath) ? readFileSync(schemaPath, "utf8") : null;
const prevTmp = path.join(tmpdir(), `jados-prev-${Date.now()}.prisma`);
if (prev) writeFileSync(prevTmp, prev);
mkdirSync(pgDir, { recursive: true });
writeFileSync(schemaPath, pgSchema);

const from = prev ? ["--from-schema-datamodel", prevTmp] : ["--from-empty"];
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
// Relative path: the project folder may contain spaces, which break the Windows shell call.
let sql = execFileSync(npx, ["prisma", "migrate", "diff", ...from, "--to-schema-datamodel", "prisma/postgres/schema.prisma", "--script"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (prev) rmSync(prevTmp, { force: true });
// Keep migrations schema-agnostic: the store lives in its own Postgres schema ("jados", set via the
// connection URL) so it can share a database with other apps without touching their tables.
sql = sql.replace(/^CREATE SCHEMA IF NOT EXISTS "public";\s*$/m, "").replace(/"public"\./g, "");

if (!sql.trim() || /^-- This is an empty migration/m.test(sql)) {
  console.log("No schema changes — no migration created.");
  process.exit(0);
}
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = path.join(pgDir, "migrations", `${stamp}_${name}`);
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, "migration.sql"), sql);
const lock = path.join(pgDir, "migrations", "migration_lock.toml");
if (!existsSync(lock)) writeFileSync(lock, 'provider = "postgresql"\n');
console.log(`Created prisma/postgres/migrations/${stamp}_${name}/migration.sql`);
