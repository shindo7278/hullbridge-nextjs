// PATCH /api/admin/faq/:id — update a FAQ
// DELETE /api/admin/faq/:id — delete a FAQ
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function PATCH(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { question, answer, category, isPublished, sortOrder } = await request.json();

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
  }

  try {
    const faq = await prisma.generalFaq.update({
      where: { id: params.id },
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
        isPublished: !!isPublished,
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    return NextResponse.json({ success: true, faq });
  } catch (err) {
    console.error("faq update error:", err);
    return NextResponse.json({ error: "Could not update FAQ" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await prisma.generalFaq.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("faq delete error:", err);
    return NextResponse.json({ error: "Could not delete FAQ" }, { status: 500 });
  }
}
