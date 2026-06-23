// POST/DELETE /api/admin/homepage/video
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";
import fs from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_MIME = ["video/mp4", "video/webm"];

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
    const fileName = `hero-${Date.now()}${path.extname(file.name || ".mp4")}`;
    const destPath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
    if (settings?.heroVideoUrl) {
      const oldPath = path.join(process.cwd(), "public", settings.heroVideoUrl);
      await fs.unlink(oldPath).catch(() => {});
    }

    await prisma.clinicSettings.upsert({
      where: { id: 1 },
      update: { heroVideoUrl: publicUrl },
      create: { id: 1, heroVideoUrl: publicUrl },
    });

    return NextResponse.json({ success: true, heroVideoUrl: publicUrl });
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
      const filePath = path.join(process.cwd(), "public", settings.heroVideoUrl);
      await fs.unlink(filePath).catch(() => {});
    }
    await prisma.clinicSettings.update({ where: { id: 1 }, data: { heroVideoUrl: null } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("hero video delete error:", err);
    return NextResponse.json({ error: "Could not remove video" }, { status: 500 });
  }
}
