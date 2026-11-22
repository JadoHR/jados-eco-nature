// Edge-safe session token helpers (used by middleware AND server code). No database access here.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "jados_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Signing key for admin session cookies.
 * Uses AUTH_SECRET when set (recommended). If it is missing on a Postgres deployment, a key is derived
 * from the private database connection string, which is already secret — anyone who has it controls
 * the database anyway. Setting or changing AUTH_SECRET later simply signs everyone out once.
 */
async function secretKey(): Promise<Uint8Array> {
  const secret = process.env.AUTH_SECRET;
  if (secret) {
    if (secret.length < 32) throw new Error("AUTH_SECRET must be a random string of at least 32 characters");
    return new TextEncoder().encode(secret);
  }
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
  if (!/^postgres(ql)?:\/\//.test(dbUrl)) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`jados-admin-session-v1:${dbUrl}`));
  return new Uint8Array(digest);
}

export async function signSession(adminId: string): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(await secretKey());
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await secretKey(), { algorithms: ["HS256"] });
    return payload.role === "admin" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
