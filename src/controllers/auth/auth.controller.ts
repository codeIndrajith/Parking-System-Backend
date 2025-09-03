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

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ErrorResponse("Please provide email and password", 400);
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { vehicles: true },
    });
    if (!user) {
      throw new ErrorResponse("Invalid credentials", 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ErrorResponse("Invalid credentials", 401);
    }
    const { password: pwd, ...userWithoutPassword } = user;
    sendTokenResponse(userWithoutPassword, 200, res);
  }
);

// @desc    Logout User
// @route   GET /api/auth/logout
// @access  Private

export const logoutController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, statusCode: 200, data: [] });
  }
);
