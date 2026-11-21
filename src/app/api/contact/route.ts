import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form.", fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ ok: true }); // bot honeypot
  await prisma.contactMessage.create({ data });
  return NextResponse.json({ ok: true });
}
