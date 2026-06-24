// POST/DELETE /api/admin/homepage/video
// Now accepts JSON { heroVideoUrl } instead of FormData
// because the file is uploaded directly from the browser to Supabase Storage
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { heroVideoUrl } = await request.json();
    if (!heroVideoUrl) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    await prisma.clinicSettings.upsert({
      where: { id: 1 },
      update: { heroVideoUrl },
      create: { id: 1, heroVideoUrl },
    });

    return NextResponse.json({ success: true, heroVideoUrl });
  } catch (err) {
    console.error("hero video save error:", err);
    return NextResponse.json({ error: "Failed to save — please try again." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
    if (settings?.heroVideoUrl) {
      // Extract path from public URL and delete from Supabase Storage
      const url = settings.heroVideoUrl;
      const pathMatch = url.match(/\/uploads\/(.+)$/);
      if (pathMatch) {
        await supabaseAdmin.storage.from("uploads").remove([pathMatch[1]]).catch(() => {});
      }
    }
    await prisma.clinicSettings.update({ where: { id: 1 }, data: { heroVideoUrl: null } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("hero video delete error:", err);
    return NextResponse.json({ error: "Could not remove video" }, { status: 500 });
  }
}