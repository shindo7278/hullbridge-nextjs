// POST /api/admin/blog/upload-image
// ============================================================
// Uploads a blog image to Supabase Storage and returns a public URL.
// Vercel's filesystem is read-only so we can't write to public/uploads —
// Supabase Storage is the correct solution for serverless deployments.
// ============================================================
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/verifyAdminSession";
import { createClient } from "@supabase/supabase-js";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const fileName = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `blog/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("uploads")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from("uploads").getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (err) {
    console.error("blog image upload error:", err);
    return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
  }
}