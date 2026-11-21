import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pgSchema } from "../scripts/pg-schema.mjs";
import { withStoreSchema } from "../src/lib/db-url.mjs";

describe("production Postgres schema", () => {
  it("is in sync with prisma/schema.prisma (run `npm run db:pg:migration -- <name>` after model changes)", () => {
    const committed = readFileSync(path.join(__dirname, "..", "prisma", "postgres", "schema.prisma"), "utf8");
    expect(committed).toBe(pgSchema);
  });

  it("puts the store in its own Postgres schema, leaving other URLs alone", () => {
    expect(withStoreSchema("postgresql://u:p@host/db?sslmode=require")).toBe("postgresql://u:p@host/db?sslmode=require&schema=jados");
    expect(withStoreSchema("postgres://u:p@host/db?schema=custom")).toBe("postgres://u:p@host/db?schema=custom");
    expect(withStoreSchema("file:./dev.db")).toBe("file:./dev.db");
  });

  it("migrations never write to the shared public schema", () => {
    const dir = path.join(__dirname, "..", "prisma", "postgres", "migrations");
    for (const m of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      expect(readFileSync(path.join(dir, m.name, "migration.sql"), "utf8")).not.toMatch(/"public"/);
    }
  });

  it("targets postgresql", () => {
    expect(pgSchema).toContain('provider  = "postgresql"');
    expect(pgSchema).not.toContain('provider = "sqlite"');
  });
});
