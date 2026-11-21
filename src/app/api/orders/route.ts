import { NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/orders";
import { checkoutSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  try {
    const { order } = await createOrder(parsed.data);
    return NextResponse.json({ reference: order.reference, token: order.accessToken }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message, code: err.code, details: err.details }, { status: 409 });
    }
    // Do not log customer details — only the error.
    console.error("Order creation failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "We could not place your order. Please try again or contact us." }, { status: 500 });
  }
}
