// POST /api/admin/pricing/categories
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Category name is required" }, { status: 400 });

  try {
    const count = await prisma.priceCategory.count();
    const category = await prisma.priceCategory.create({
      data: { name: name.trim(), sortOrder: count },
    });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error("category create error:", err);
    return NextResponse.json({ error: "Could not create category" }, { status: 500 });
  }
}
