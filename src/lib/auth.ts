import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession, verifySession } from "./session-token";

export async function getAdmin() {
  const store = await cookies();
  const adminId = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!adminId) return null;
  return prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true },
  });
}

/** Call at the top of EVERY admin page, server action and route handler. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function startSession(adminId: string) {
  const token = await signSession(adminId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Simple in-memory login throttle (per server instance). Good enough for an MVP;
// use a shared store (e.g. Redis) if you run several instances.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function loginThrottled(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else entry.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}

export async function audit(adminId: string | null, action: string, entity: string, entityId = "", details = "") {
  await prisma.auditLog.create({ data: { adminId, action, entity, entityId, details: details.slice(0, 1000) } });
}
