import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { ErrorResponse } from "../../utils/errorResponse";
import bcrypt from "bcryptjs";
import { sendTokenResponse } from "../../utils/sendTokenResponse";
import { PrismaClient } from "@prisma/client";
import { IRequest } from "../../types/auth.types";

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

// @desc    Auth User
// @route   GET /api/auth/user
// @access  Private
export const authUserController = asyncHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const userId = req?.user?.id as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vehicles: true },
    });

    if (!user) {
      throw new ErrorResponse("user not found", 404);
    }
    const { password: pwd, ...userWithoutPassword } = user;
    res
      .status(200)
      .json({ success: true, statusCode: 200, data: userWithoutPassword });
  }
);

// @desc    Auth User
// @route   PUT /api/auth/user-update
// @access  Private
export const authUserCredUpdateController = asyncHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const userId = req?.user?.id as string;
    const { name, email, role, vehicles } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vehicles: true },
    });

    if (!user) {
      throw new ErrorResponse("user not found", 404);
    }

    // If email changed, ensure it's not used by another user
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        throw new ErrorResponse("Email already in use", 409);
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const finalRole = role ?? user.role;

    if (finalRole === "Student") {
      if (Array.isArray(vehicles)) {
        updateData.vehicles = {
          deleteMany: {},
          create: vehicles.map((v: any) => ({
            plateNo: v.plateNo,
            brand: v.brand,
            model: v.model,
            color: v.color,
          })),
        };
      }
    } else {
      if (user.vehicles && user.vehicles.length > 0) {
        updateData.vehicles = { deleteMany: {} };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { vehicles: true },
    });

    const { password: pwd, ...userWithoutPassword } = updatedUser;
    res
      .status(200)
      .json({ success: true, statusCode: 200, data: userWithoutPassword });
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
