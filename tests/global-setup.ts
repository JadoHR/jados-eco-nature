import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

// Integration tests run against a throwaway SQLite file (prisma/test.db) — never the dev database.
export default function setup() {
  for (const suffix of ["", "-journal"]) {
    rmSync(path.join(__dirname, "..", "prisma", `test.db${suffix}`), { force: true });
  }
  execSync("npx prisma db push --skip-generate", {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
