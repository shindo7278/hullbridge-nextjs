// POST/DELETE /api/admin/homepage/video
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";
import { createClient } from "@supabase/supabase-js";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_MIME = ["video/mp4", "video/webm"];

const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("video");

    if (!file) return NextResponse.json({ error: "No video file received" }, { status: 400 });
    if (!ACCEPTED_MIME.includes(file.type)) {
      return NextResponse.json({ error: "Please upload an MP4 or WebM video" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File is too large — please keep it under 25MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type === "video/webm" ? "webm" : "mp4";
    const fileName = `hero-${Date.now()}.${ext}`;
    const filePath = `homepage/${fileName}`;

    // Delete old video from Supabase Storage if exists
    const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
    if (settings?.heroVideoUrl) {
      const oldPath = settings.heroVideoUrl.split("/uploads/")[1];
      if (oldPath) {
        await supabaseAdmin.storage.from("uploads").remove([oldPath]).catch(() => {});
      }
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from("uploads")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Supabase video upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from("uploads").getPublicUrl(filePath);

    await prisma.clinicSettings.upsert({
      where: { id: 1 },
      update: { heroVideoUrl: data.publicUrl },
      create: { id: 1, heroVideoUrl: data.publicUrl },
    });

    return NextResponse.json({ success: true, heroVideoUrl: data.publicUrl });
  } catch (err) {
    console.error("hero video upload error:", err);
    return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
    if (settings?.heroVideoUrl) {
      const oldPath = settings.heroVideoUrl.split("/uploads/")[1];
      if (oldPath) {
        await supabaseAdmin.storage.from("uploads").remove([oldPath]).catch(() => {});
      }
    }
    await prisma.clinicSettings.update({ where: { id: 1 }, data: { heroVideoUrl: null } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("hero video delete error:", err);
    return NextResponse.json({ error: "Could not remove video" }, { status: 500 });
  }
}