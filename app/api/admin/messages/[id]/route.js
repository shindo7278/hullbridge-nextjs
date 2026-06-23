// PATCH /api/admin/messages/:id
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function PATCH(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = params;
  const { status } = await request.json();
  const allowed = ["NEW", "READ", "REPLIED"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  try {
    const updated = await prisma.contactMessage.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error("admin message update error:", err);
    return NextResponse.json({ error: "Could not update message" }, { status: 500 });
  }
}
