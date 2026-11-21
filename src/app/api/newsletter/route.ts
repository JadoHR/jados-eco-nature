import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { newsletterSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true }); // bot honeypot
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { consentAt: new Date() },
    create: { email: parsed.data.email },
  });
  return NextResponse.json({ ok: true });
}
