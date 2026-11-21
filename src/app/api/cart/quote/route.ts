import { NextResponse } from "next/server";
import { quoteCart } from "@/lib/orders";
import { quoteSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Re-prices the client cart from the database (prices, stock, availability, delivery fee). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  const quote = await quoteCart(parsed.data);
  return NextResponse.json(quote);
}
