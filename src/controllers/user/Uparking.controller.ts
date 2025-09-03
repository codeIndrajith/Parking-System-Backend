import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { PrismaClient } from "../../generated/prisma";
import { ResponseFormat } from "../../types/responseFormat";
const prisma = new PrismaClient();
// @desc    Get all parking
// @route   GET /api/user/parkings
// @access  Public

export const getParkings = asyncHandler(
  async (
    req: Request,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const parkings = await prisma.parkingLocation.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        blocks: {
          where: {
            isFull: false,
          },
          select: {
            id: true,
            locationId: true,
            blockName: true,
            totalSlots: true,
            availableSlots: true,
            isFull: true,
          },
        },
      },
    });

    res.status(200).json({ success: true, statusCode: 200, data: parkings });
  }
);
