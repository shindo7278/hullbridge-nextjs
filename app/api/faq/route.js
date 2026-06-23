// GET /api/faq — public endpoint, returns only published FAQs
// Used by the public FAQ page and its JSON-LD FAQPage schema.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faqs = await prisma.generalFaq.findMany({
      where: { isPublished: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      select: { id: true, question: true, answer: true, category: true },
    });
    return NextResponse.json({ faqs });
  } catch (err) {
    console.error("public faq error:", err);
    return NextResponse.json({ faqs: [] });
  }
}
