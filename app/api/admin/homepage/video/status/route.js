// GET /api/admin/homepage/video — returns the current hero video URL (if any)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
    return NextResponse.json({ heroVideoUrl: settings?.heroVideoUrl || null });
  } catch (err) {
    console.error("get hero video error:", err);
    return NextResponse.json({ error: "Could not load video settings" }, { status: 500 });
  }
}
