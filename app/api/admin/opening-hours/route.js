// GET /api/admin/opening-hours — weekly schedule + upcoming exceptions
// PUT /api/admin/opening-hours — replace the whole weekly schedule
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const [hours, exceptions] = await Promise.all([
      prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } }),
      prisma.scheduleException.findMany({ orderBy: { date: "asc" }, where: { date: { gte: new Date() } } }),
    ]);
    return NextResponse.json({ hours, exceptions });
  } catch (err) {
    console.error("opening-hours get error:", err);
    return NextResponse.json({ error: "Could not load schedule" }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { hours } = await request.json();
  if (!Array.isArray(hours)) return NextResponse.json({ error: "hours array is required" }, { status: 400 });

  try {
    await prisma.$transaction([
      prisma.openingHour.deleteMany({}),
      prisma.openingHour.createMany({
        data: hours.map((h) => ({ dayOfWeek: h.dayOfWeek, isOpen: h.isOpen, startTime: h.startTime, endTime: h.endTime })),
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("opening-hours save error:", err);
    return NextResponse.json({ error: "Could not save schedule" }, { status: 500 });
  }
}
