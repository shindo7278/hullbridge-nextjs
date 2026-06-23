// ============================================================
// One-time setup script: creates the first admin account.
// ============================================================
// Run this ONCE after the database is connected:
//   node backend/prisma/seed-admin.js
//
// The password is hashed with bcrypt before it ever touches the
// database — it is never stored anywhere as plain text, including
// in this file. Change ADMIN_EMAIL below if needed, or pass a
// different one as an environment variable before running.
//
// ⚠️ After running this once, delete or rename this file (or at
// least change the password from the admin panel) so the same
// credentials aren't sitting in version control indefinitely.
// ============================================================
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@hullbridgedentalclinic.co.uk";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "AaMm778899$$";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Clinic Admin";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const user = await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash }, // re-running this script resets the password
    create: {
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      name: ADMIN_NAME,
      role: "OWNER",
    },
  });

  console.log(`✅ Admin account ready: ${user.email}`);
  console.log(`   Log in at /admin/login with the password you set.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
