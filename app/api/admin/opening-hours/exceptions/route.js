// POST /api/admin/opening-hours/exceptions
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { date, isOpen, startTime, endTime, reason } = await request.json();
  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  try {
    const exception = await prisma.scheduleException.create({
      data: {
        date: new Date(date),
        isOpen: !!isOpen,
        startTime: isOpen ? startTime : null,
        endTime: isOpen ? endTime : null,
        reason: reason || null,
      },
    });
    return NextResponse.json({ success: true, exception }, { status: 201 });
  } catch (err) {
    console.error("exception create error:", err);
    return NextResponse.json({ error: "Could not save exception" }, { status: 500 });
  }
}
