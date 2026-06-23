// GET  /api/admin/blog — list all posts (published + drafts)
// POST /api/admin/blog — create a new post
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export async function GET(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        linkedService: { select: { id: true, name: true, slug: true } },
        linkedPost: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("admin blog list error:", err);
    return NextResponse.json({ error: "Could not load posts" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const {
    title, excerpt, bodyContent, coverImageUrl, secondImageUrl,
    metaTitle, metaDescription, isPublished, linkedServiceId, linkedPostId,
  } = body;

  if (!title || !excerpt || !bodyContent) {
    return NextResponse.json({ error: "title, excerpt and bodyContent are required" }, { status: 400 });
  }

  try {
    const slug = slugify(title);
    const post = await prisma.blogPost.create({
      data: {
        slug, title, excerpt, bodyContent,
        coverImageUrl: coverImageUrl || null,
        secondImageUrl: secondImageUrl || null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
        linkedServiceId: linkedServiceId || null,
        linkedPostId: linkedPostId || null,
      },
    });
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (err) {
    console.error("admin blog create error:", err);
    return NextResponse.json({ error: "Could not create post — check the title isn't already used" }, { status: 500 });
  }
}
