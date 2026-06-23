// DELETE /api/admin/opening-hours/exceptions/:id
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function DELETE(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = params;
  try {
    await prisma.scheduleException.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("exception delete error:", err);
    return NextResponse.json({ error: "Could not remove exception" }, { status: 500 });
  }
}
