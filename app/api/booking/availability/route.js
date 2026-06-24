// GET /api/booking/availability?date=YYYY-MM-DD&serviceId=xxx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLOT_INTERVAL_MINUTES = 30;

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date) {
    return NextResponse.json({ error: "date query param is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const requestedDate = new Date(date + "T00:00:00.000Z");
  if (isNaN(requestedDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    return NextResponse.json({ date, slots: [], reason: "past-date" });
  }

  try {
    const exception = await prisma.scheduleException.findFirst({
      where: { date: requestedDate },
    });

    let dayWindows = [];
    if (exception) {
      if (!exception.isOpen) {
        return NextResponse.json({ date, slots: [], reason: exception.reason || "closed" });
      }
      if (exception.startTime && exception.endTime) {
        dayWindows = [{ startTime: exception.startTime, endTime: exception.endTime }];
      }
    }

    if (dayWindows.length === 0) {
      const dayOfWeek = new Date(date + "T12:00:00").getDay();
      const hours = await prisma.openingHour.findMany({ where: { dayOfWeek, isOpen: true } });
      if (hours.length === 0) {
        return NextResponse.json({ date, slots: [], reason: "closed" });
      }
      dayWindows = hours.map((h) => ({ startTime: h.startTime, endTime: h.endTime }));
    }

    let durationMinutes = SLOT_INTERVAL_MINUTES;
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service) durationMinutes = service.durationMinutes;
    }

    const candidateSlots = [];
    for (const window of dayWindows) {
      let cursor = timeToMinutes(window.startTime);
      const end = timeToMinutes(window.endTime);
      while (cursor + durationMinutes <= end) {
        candidateSlots.push(minutesToTime(cursor));
        cursor += SLOT_INTERVAL_MINUTES;
      }
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        date: requestedDate,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startTime: true },
    });

    const takenTimes = new Set(existingBookings.map((b) => b.startTime));
    const availableSlots = candidateSlots.filter((slot) => !takenTimes.has(slot));

    return NextResponse.json({ date, slots: availableSlots });
  } catch (err) {
    console.error("availability error:", err);
    return NextResponse.json({ error: "Could not load availability" }, { status: 500 });
  }
}