import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    // Integration tests use their own throwaway SQLite database — never the dev database.
    env: { DATABASE_URL: "file:./test.db", STORE_MODE: "demo", AUTH_SECRET: "test-secret-test-secret-test-secret-1234" },
    fileParallelism: false,
  },
});
