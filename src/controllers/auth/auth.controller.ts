import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { PrismaClient } from "../../generated/prisma";
import { ErrorResponse } from "../../utils/errorResponse";
import bcrypt from "bcryptjs";
import { sendTokenResponse } from "../../utils/sendTokenResponse";

const prisma = new PrismaClient();

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
export const authController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, vehicles } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ErrorResponse("User already exists", 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        vehicles:
          role === "User" && Array.isArray(vehicles)
            ? {
                create: vehicles.map((v: any) => ({
                  plateNo: v.plateNo,
                  brand: v.brand,
                  model: v.model,
                  color: v.color,
                })),
              }
            : undefined,
      },
      include: { vehicles: true },
    });

    const { password: pwd, ...userWithoutPassword } = newUser;
    sendTokenResponse(userWithoutPassword, 201, res);
  }
);
