// ============================================================
// One-time setup script: fills in a sensible default weekly
// schedule so the booking calendar isn't empty on first run.
// Run once with: npm run seed:hours
// Adjust the days/times here to match the real clinic hours, or
// just edit them later from /admin/opening-hours instead.
// ============================================================
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 0 = Sunday ... 6 = Saturday
const DEFAULT_HOURS = [
  { dayOfWeek: 0, isOpen: false, startTime: "09:00", endTime: "17:00" }, // Sunday
  { dayOfWeek: 1, isOpen: true, startTime: "09:00", endTime: "17:00" }, // Monday
  { dayOfWeek: 2, isOpen: false, startTime: "09:00", endTime: "17:00" }, // Tuesday
  { dayOfWeek: 3, isOpen: true, startTime: "10:00", endTime: "17:00" }, // Wednesday
  { dayOfWeek: 4, isOpen: true, startTime: "10:00", endTime: "17:00" }, // Thursday
  { dayOfWeek: 5, isOpen: true, startTime: "10:00", endTime: "17:00" }, // Friday
  { dayOfWeek: 6, isOpen: false, startTime: "09:00", endTime: "13:00" }, // Saturday
];

async function main() {
  const existing = await prisma.openingHour.count();
  if (existing > 0) {
    console.log(`ℹ️  Opening hours already exist (${existing} rows) — skipping. Edit them from /admin/opening-hours instead.`);
    return;
  }

  await prisma.openingHour.createMany({ data: DEFAULT_HOURS });
  console.log("✅ Default opening hours created. Edit them any time at /admin/opening-hours.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
