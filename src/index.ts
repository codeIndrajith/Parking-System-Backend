import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./app";
import { prisma } from "./config/database";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test Prisma connection (optional)
    await prisma.$queryRaw`SELECT 1`;

    app(req as any, res as any);
  } catch (error) {
    console.error("Serverless function error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
