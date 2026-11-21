import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pgSchema } from "../scripts/pg-schema.mjs";

describe("production Postgres schema", () => {
  it("is in sync with prisma/schema.prisma (run `npm run db:pg:migration -- <name>` after model changes)", () => {
    const committed = readFileSync(path.join(__dirname, "..", "prisma", "postgres", "schema.prisma"), "utf8");
    expect(committed).toBe(pgSchema);
  });

  it("targets postgresql", () => {
    expect(pgSchema).toContain('provider  = "postgresql"');
    expect(pgSchema).not.toContain('provider = "sqlite"');
  });
});
