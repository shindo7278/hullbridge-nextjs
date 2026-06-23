// DELETE /api/admin/pricing/items/:id
// Removes the price item and, if nothing else references it, the
// linked Service page too — so deleting a price never leaves an
// orphaned page on /services.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function DELETE(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = params;
  try {
    const item = await prisma.priceItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    await prisma.priceItem.delete({ where: { id } });

    if (item.serviceId) {
      const stillUsed = await prisma.priceItem.findFirst({ where: { serviceId: item.serviceId } });
      if (!stillUsed) {
        await prisma.service.delete({ where: { id: item.serviceId } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("pricing delete error:", err);
    return NextResponse.json({ error: "Could not delete item" }, { status: 500 });
  }
}
