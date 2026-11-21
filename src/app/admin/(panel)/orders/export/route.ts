import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin, audit } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/config";
import { currencyExponent } from "@/lib/money";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  const valid = ORDER_STATUSES.some((s) => s.value === status) ? status : undefined;
  const orders = await prisma.order.findMany({
    where: valid ? { status: valid } : {},
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const major = (minor: number, currency: string) => {
    const exp = currencyExponent(currency);
    if (exp === 0) return String(minor);
    return `${Math.floor(minor / 10 ** exp)}.${String(minor % 10 ** exp).padStart(exp, "0")}`;
  };

  const rows = orders.map((o) => [
    o.reference,
    o.createdAt.toISOString(),
    o.status,
    o.paymentStatus,
    o.customerName,
    o.phone,
    o.email,
    o.fulfilmentMethod,
    o.deliveryZoneName,
    o.address,
    o.city,
    o.notes,
    o.items.map((i) => `${i.quantity} x ${i.productName} (${i.sku})`).join("; "),
    major(o.subtotalMinor, o.currency),
    major(o.deliveryFeeMinor, o.currency),
    major(o.totalMinor, o.currency),
    o.currency,
    o.paymentMethod,
    o.isDemo ? "yes" : "no",
  ]);
  const csv = toCsv(
    ["Reference", "Created (UTC)", "Status", "Payment", "Customer", "Phone", "Email", "Fulfilment", "Area", "Address", "City", "Notes", "Items", "Subtotal", "Delivery", "Total", "Currency", "Payment method", "Demo"],
    rows,
  );
  await audit(admin.id, "orders.export", "Order", "", `${orders.length} orders${valid ? ` (${valid})` : ""}`);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jados-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
