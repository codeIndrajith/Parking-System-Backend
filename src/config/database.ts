import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error: any) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};
export { prisma, connectDB };
