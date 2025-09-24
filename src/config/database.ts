import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Optional: for logging only, no process.exit
export const connectDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`; // simple test query
    console.log("Database connection OK");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
