/**
 * Create (or reset the password of) an admin account.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long passphrase' ADMIN_NAME='Your Name' npm run admin:create
 *
 * On Windows PowerShell:
 *   $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a long passphrase"; npm run admin:create
 *
 * Passwords are hashed with bcrypt; nothing is hard-coded.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = (process.env.ADMIN_NAME ?? "").trim() || "JADOS Admin";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email address.");
  }
  if (password.length < 12) {
    throw new Error("Set ADMIN_PASSWORD to at least 12 characters (a passphrase is best).");
  }

  // Vercel builds set ADMIN_CREATE_ONLY=1: create the first admin once, never reset an existing password.
  if (process.env.ADMIN_CREATE_ONLY === "1" && (await prisma.adminUser.findUnique({ where: { email } }))) {
    console.log(`Admin ${email} already exists — leaving it unchanged.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, name, passwordHash },
  });
  await prisma.auditLog.create({
    data: { adminId: admin.id, action: "admin.create_or_reset", entity: "AdminUser", entityId: admin.id },
  });
  console.log(`Admin account ready for ${email}. Remove ADMIN_PASSWORD from your environment now.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
