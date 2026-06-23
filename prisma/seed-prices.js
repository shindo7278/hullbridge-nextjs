// ============================================================
// One-time setup: creates default price categories and items so
// /admin/pricing and /our-prices both have real data on first run.
// Run with: npm run seed:prices
// Edit prices any time from /admin/pricing — this script checks
// whether data already exists and skips if so.
// ============================================================
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_PRICES = [
  {
    name: "Examinations & Diagnosis",
    sortOrder: 0,
    items: [
      { name: "New patient examination", price: 33.00, sortOrder: 0 },
      { name: "Routine examination",      price: 25.00, sortOrder: 1 },
      { name: "Single X-ray",             price: 15.00, sortOrder: 2 },
      { name: "Emergency examination",    price: 40.00, sortOrder: 3 },
    ],
  },
  {
    name: "Preventative Care",
    sortOrder: 1,
    items: [
      { name: "Standard scale & polish",      price: 70.00, sortOrder: 0 },
      { name: "Fluoride application",          price: 20.00, sortOrder: 1 },
      { name: "Fissure sealant (per tooth)",   price: 30.00, sortOrder: 2 },
    ],
  },
  {
    name: "Restorative Treatment",
    sortOrder: 2,
    items: [
      { name: "White filling (small)",           price: 100.00, priceSuffix: "+", sortOrder: 0 },
      { name: "White filling (large)",           price: 140.00, priceSuffix: "+", sortOrder: 1 },
      { name: "Root canal (front tooth)",        price: 280.00, priceSuffix: "+", sortOrder: 2 },
      { name: "Root canal (molar)",              price: 450.00, priceSuffix: "+", sortOrder: 3 },
      { name: "Crown (porcelain)",               price: 450.00, priceSuffix: "+", sortOrder: 4 },
      { name: "Denture (acrylic, per arch)",     price: 395.00, priceSuffix: "+", sortOrder: 5 },
    ],
  },
  {
    name: "Cosmetic Treatment",
    sortOrder: 3,
    items: [
      { name: "Tooth whitening (home kit)",      price: 375.00, sortOrder: 0 },
      { name: "Porcelain veneer (per tooth)",    price: 480.00, priceSuffix: "+", sortOrder: 1 },
    ],
  },
  {
    name: "Oral Surgery",
    sortOrder: 4,
    items: [
      { name: "Simple extraction",               price: 110.00, priceSuffix: "+", sortOrder: 0 },
      { name: "Surgical extraction",             price: 180.00, priceSuffix: "+", sortOrder: 1 },
    ],
  },
  {
    name: "Mouth Guards",
    sortOrder: 5,
    items: [
      { name: "Sports guard",                    price: 90.00,  sortOrder: 0 },
      { name: "Night guard (clenching/grinding)", price: 150.00, sortOrder: 1 },
    ],
  },
];

async function main() {
  const existing = await prisma.priceCategory.count();
  if (existing > 0) {
    console.log(`ℹ️  Price categories already exist (${existing}) — skipping. Edit from /admin/pricing instead.`);
    return;
  }

  for (const cat of DEFAULT_PRICES) {
    const created = await prisma.priceCategory.create({
      data: {
        name: cat.name,
        sortOrder: cat.sortOrder,
        items: {
          create: cat.items.map((item) => ({
            name: item.name,
            price: item.price,
            priceSuffix: item.priceSuffix || null,
            sortOrder: item.sortOrder,
          })),
        },
      },
    });
    console.log(`✅ Created: ${created.name} (${cat.items.length} items)`);
  }

  console.log("\n✅ Default prices ready. Edit any time at /admin/pricing.");
}

main()
  .catch((err) => { console.error("Seed failed:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
