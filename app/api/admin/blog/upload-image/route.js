// POST /api/admin/blog/upload-image
// ============================================================
// Uploads a blog image, compresses it, and returns a URL string —
// the database only ever stores that URL (BlogPost.coverImageUrl /
// secondImageUrl), never the binary image data. This keeps the
// database small and fast, and means images can be served directly
// by the web server / CDN instead of round-tripping through Postgres.
//
// Compression uses `sharp` to resize to a sane max width and convert
// to WebP, which is typically 25-35% smaller than an equivalent JPEG
// at the same visual quality — meaningful for mobile page speed.
// ============================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB upload limit before compression
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_WIDTH = 1600; // images never need to be wider than this for a blog post

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) return NextResponse.json({ error: "No image file received" }, { status: 400 });
    if (!ACCEPTED_MIME.includes(file.type)) {
      return NextResponse.json({ error: "Please upload a JPG, PNG, or WebP image" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Image is too large — please keep it under 10MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Resize (only if larger than MAX_WIDTH) and convert to WebP —
    // this is the actual "compression" step that keeps page weight low.
    const compressed = await sharp(bytes)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const destPath = path.join(process.cwd(), "public", "uploads", "blog", fileName);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, compressed);

    const publicUrl = `/uploads/blog/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("blog image upload error:", err);
    return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
  }
}
