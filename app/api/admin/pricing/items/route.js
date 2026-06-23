// POST/PATCH /api/admin/pricing/items
// ============================================================
// One write does two jobs: always upserts the PriceItem, and — if
// createServicePage is true — also upserts a matching Service record
// and links them via PriceItem.serviceId. That link is what makes a
// price-list entry instantly appear under /services/[slug] too.
// ============================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/verifyAdminSession";

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

async function handleSave(request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { id, categoryId, name, price, priceSuffix, createServicePage, serviceCategory, serviceSummary } = body;

  if (!categoryId || !name || price === undefined) {
    return NextResponse.json({ error: "categoryId, name and price are required" }, { status: 400 });
  }

  try {
    let serviceId = null;

    if (createServicePage) {
      const slug = slugify(name);
      const service = await prisma.service.upsert({
        where: { slug },
        update: { name, category: serviceCategory || "General Dentistry", shortSummary: serviceSummary || "", priceFrom: price },
        create: {
          slug, name, category: serviceCategory || "General Dentistry",
          shortSummary: serviceSummary || "", bodyContent: serviceSummary || "",
          priceFrom: price, isPublished: true,
        },
      });
      serviceId = service.id;
    }

    const priceItem = id
      ? await prisma.priceItem.update({ where: { id }, data: { categoryId, name, price, priceSuffix: priceSuffix || null, serviceId } })
      : await prisma.priceItem.create({ data: { categoryId, name, price, priceSuffix: priceSuffix || null, serviceId } });

    return NextResponse.json({ success: true, priceItem, hasServicePage: !!serviceId });
  } catch (err) {
    console.error("pricing item save error:", err);
    return NextResponse.json({ error: "Could not save item" }, { status: 500 });
  }
}

export async function POST(request) {
  return handleSave(request);
}
export async function PATCH(request) {
  return handleSave(request);
}
