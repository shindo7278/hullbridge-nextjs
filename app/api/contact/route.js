// POST /api/contact
// ============================================================
// Saves the message FIRST, unconditionally — the patient's message
// is never lost even if the notification email fails. The email is
// a best-effort second step.
// ============================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const CLINIC_NOTIFICATION_EMAIL = "info@hullbridgedentalclinic.co.uk";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  const { name, email, phone, message } = await request.json();

  const errors = [];
  if (!name || name.trim().length < 2) errors.push("Please enter your name.");
  if (!email || !isValidEmail(email)) errors.push("Please enter a valid email address.");
  if (!message || message.trim().length < 10) errors.push("Please add a few more details to your message.");
  if (phone && !/^\+?[\d\s\-()]{7,}$/.test(phone)) errors.push("Please enter a valid phone number.");

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  let savedMessage;
  try {
    savedMessage = await prisma.contactMessage.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || null, message: message.trim() },
    });
  } catch (err) {
    console.error("contact message save error:", err);
    return NextResponse.json(
      { error: "Could not send your message. Please call us instead on 01702 231 067." },
      { status: 500 }
    );
  }

  // Best-effort notification email — skipped entirely if RESEND_API_KEY
  // isn't set yet (e.g. during local development / demo to a buyer),
  // so the form still works end-to-end without it.
  if (resend) {
    try {
      await resend.emails.send({
        from: "Hullbridge Dental Clinic Website <noreply@hullbridgedentalclinic.co.uk>",
        to: CLINIC_NOTIFICATION_EMAIL,
        replyTo: savedMessage.email,
        subject: `New website enquiry from ${savedMessage.name}`,
        text: `New message via the Contact Us form:\n\nName: ${savedMessage.name}\nEmail: ${savedMessage.email}\nPhone: ${savedMessage.phone || "Not provided"}\n\nMessage:\n${savedMessage.message}`,
      });
      await prisma.contactMessage.update({ where: { id: savedMessage.id }, data: { emailSentOk: true } });
    } catch (emailErr) {
      console.error("contact notification email failed:", emailErr);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
