// GET/PATCH/DELETE /api/admin/blog/:id
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export async function GET(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error("admin blog get error:", err);
    return NextResponse.json({ error: "Could not load post" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const {
    title, excerpt, bodyContent, coverImageUrl, secondImageUrl,
    metaTitle, metaDescription, isPublished, linkedServiceId, linkedPostId,
  } = body;

  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const wasPublished = existing.isPublished;
    const data = {
      title, excerpt, bodyContent,
      coverImageUrl: coverImageUrl || null,
      secondImageUrl: secondImageUrl || null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      isPublished: !!isPublished,
      linkedServiceId: linkedServiceId || null,
      linkedPostId: linkedPostId || null,
    };

    // title changed → slug should follow it (only if not already published,
    // to avoid breaking a URL that might already be indexed by Google)
    if (title && title !== existing.title && !wasPublished) {
      data.slug = slugify(title);
    }
    // first time being published → stamp the publish date
    if (!wasPublished && data.isPublished) {
      data.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, post });
  } catch (err) {
    console.error("admin blog update error:", err);
    return NextResponse.json({ error: "Could not update post" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("admin blog delete error:", err);
    return NextResponse.json({ error: "Could not delete post" }, { status: 500 });
  }
}
