// GET /api/admin/messages
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("admin messages list error:", err);
    return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
  }
}
