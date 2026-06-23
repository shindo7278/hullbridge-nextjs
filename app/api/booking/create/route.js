// POST /api/booking/create
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
  const digits = phone.replace(/[\s\-()]/g, "");
  return /^(\+?\d{10,15})$/.test(digits);
}

export async function POST(request) {
  const body = await request.json();
  const {
    date, startTime, serviceId, patientName, patientPhone,
    patientEmail, patientAge, notes, source = "ONLINE",
  } = body;

  const errors = [];
  if (!date) errors.push("date is required");
  if (!startTime) errors.push("startTime is required");
  if (!patientName || patientName.trim().length < 2) errors.push("patientName is required");
  if (!patientPhone || !isValidPhone(patientPhone)) errors.push("a valid WhatsApp number is required");
  if (!patientEmail || !isValidEmail(patientEmail)) errors.push("a valid email is required");
  if (!patientAge || patientAge < 0 || patientAge > 120) errors.push("a valid age is required");

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const appointmentDate = new Date(date);
  if (isNaN(appointmentDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  let durationMinutes = 30;
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (service) durationMinutes = service.durationMinutes;
  }
  const [h, m] = startTime.split(":").map(Number);
  const endMinutes = h * 60 + m + durationMinutes;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  try {
    const booking = await prisma.booking.create({
      data: {
        date: appointmentDate,
        startTime,
        endTime,
        status: source === "ADMIN" ? "CONFIRMED" : "PENDING",
        source,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim().toLowerCase(),
        patientAge: Number(patientAge),
        serviceId: serviceId || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "This time slot was just booked by someone else. Please choose another time." },
        { status: 409 }
      );
    }
    console.error("booking create error:", err);
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }
}
