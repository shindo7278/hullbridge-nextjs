// PATCH /api/admin/bookings/:id
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function PATCH(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = params;
  const { status } = await request.json();
  const allowed = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  try {
    const updated = await prisma.booking.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error("admin booking update error:", err);
    return NextResponse.json({ error: "Could not update booking" }, { status: 500 });
  }
}
