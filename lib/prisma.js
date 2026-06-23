// ============================================================
// Standard Next.js Prisma singleton pattern. Without this, hot
// reloading in development creates a new PrismaClient on every file
// change and quickly exhausts the database's connection limit.
// ============================================================
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
