// GET /api/admin/blog/link-options
// Returns lightweight lists of services and posts for the "link to"
// dropdowns in the post editor — keeps the editor from having to
// fetch full Service/BlogPost records just to populate a <select>.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const [services, posts] = await Promise.all([
      prisma.service.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
      prisma.blogPost.findMany({ select: { id: true, title: true, slug: true }, orderBy: { title: "asc" } }),
    ]);
    return NextResponse.json({ services, posts });
  } catch (err) {
    console.error("link options error:", err);
    return NextResponse.json({ error: "Could not load options" }, { status: 500 });
  }
}
