// GET /api/admin/pricing — categories + items
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const categories = await prisma.priceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { service: { select: { id: true, slug: true } } },
        },
      },
    });

    const shaped = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item, hasServicePage: !!item.serviceId })),
    }));

    return NextResponse.json({ categories: shaped });
  } catch (err) {
    console.error("pricing list error:", err);
    return NextResponse.json({ error: "Could not load pricing" }, { status: 500 });
  }
}
