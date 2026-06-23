// GET /api/admin/bookings?date=YYYY-MM-DD
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date query param is required" }, { status: 400 });

  try {
    const bookings = await prisma.booking.findMany({
      where: { date: new Date(date) },
      orderBy: { startTime: "asc" },
      include: { service: { select: { name: true } } },
    });
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("admin bookings list error:", err);
    return NextResponse.json({ error: "Could not load bookings" }, { status: 500 });
  }
}
