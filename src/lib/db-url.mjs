// Shared by the app (src/lib/db.ts) and the Vercel build script.
// On Postgres the store uses its own schema so it never touches other apps' tables in a shared database.
export const STORE_PG_SCHEMA = "jados";

/** @param {string | undefined} url */
export function withStoreSchema(url) {
  if (!url || !/^postgres(ql)?:\/\//.test(url)) return url;
  const u = new URL(url);
  if (!u.searchParams.has("schema")) u.searchParams.set("schema", STORE_PG_SCHEMA);
  return u.toString();
}
