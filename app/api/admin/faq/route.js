// GET  /api/admin/faq — list all general FAQs
// POST /api/admin/faq — create a new FAQ
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const faqs = await prisma.generalFaq.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ faqs });
  } catch (err) {
    console.error("faq list error:", err);
    return NextResponse.json({ error: "Could not load FAQs" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { question, answer, category, isPublished } = await request.json();

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
  }

  try {
    const count = await prisma.generalFaq.count();
    const faq = await prisma.generalFaq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
        isPublished: !!isPublished,
        sortOrder: count,
      },
    });
    return NextResponse.json({ success: true, faq }, { status: 201 });
  } catch (err) {
    console.error("faq create error:", err);
    return NextResponse.json({ error: "Could not create FAQ" }, { status: 500 });
  }
}
