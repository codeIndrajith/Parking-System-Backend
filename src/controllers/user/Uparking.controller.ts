import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { ResponseFormat } from "../../types/responseFormat";
import { IRequest } from "../../types/auth.types";
import { ErrorResponse } from "../../utils/errorResponse";
import { IBlockResponse } from "../../types/blocks";
import { PrismaClient } from "@prisma/client";
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

// @desc    Get single Block
// @route   GET /api/user/block/:id
// @access  Public
export const getBlock = asyncHandler(
  async (
    req: Request,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const block = await prisma.block.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        blockName: true,
        locationId: true,
        totalSlots: true,
        availableSlots: true,
        isFull: true,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: block ?? {},
    });
  }
);

// @desc    Parking Book (Onlline or withour online)
// @route   POST /api/user/parkings
// @access  Private

export const bookParking = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const userId = req?.user?.id as string;

    const { blockId, entryTime, exitTime, paymentStatus, date } = req.body as {
      blockId: string;
      entryTime: string; // format: "2025-09-18T08:00:00Z"
      exitTime: string; // format: "2025-09-18T12:00:00Z"
      paymentStatus: "PAID" | "UNPAID";
      date: string;
    };

    if (!blockId) {
      throw new ErrorResponse("Select a block for booking", 400);
    }

    await prisma.$transaction(async (tx: any) => {
      const block = await tx.block.findUnique({
        where: { id: blockId },
      });

      if (!block) {
        throw new ErrorResponse("Block not found", 404);
      }

      if (block.availableSlots <= 0) {
        throw new ErrorResponse(
          "Slots are full. Can't book at this moment",
          400
        );
      }

      const start = new Date(entryTime).getTime();
      const end = new Date(exitTime).getTime();
      const timeDuration = Math.ceil((end - start) / (1000 * 60 * 60));

      await tx.booking.create({
        data: {
          userId,
          blockId,
          paymentStatus,
          bookingType: paymentStatus === "PAID" ? "ONLINE" : "WALK_IN",
          duration: timeDuration,
          trackTime: 0,
          entryTime,
          exitTime,
          date,
        },
      });
      if (paymentStatus === "UNPAID") {
        await tx.block.update({
          where: { id: blockId },
          data: { availableSlots: { decrement: 1 } },
        });
      }
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "Booking successful",
      });
    });
  }
);

// @desc    Pay Bill for Online Booking
// @route   PUT /api/user/parkings/pay/:bookingId
// @access  Private

export const payForBooking = asyncHandler(
  async (
    req: Request,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { bookingId } = req.params;

    await prisma.$transaction(async (tx: any) => {
      const bookingRecord = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!bookingRecord) {
        throw new ErrorResponse("Booking record not found", 404);
      }
      await tx.booking.update({
        where: { id: bookingRecord.id },
        data: {
          status: "PAY",
        },
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Booking Paid Complete",
        data: bookingId,
      });
    });
  }
);

// @desc    Confirm for Online Booking
// @route   PUT /api/user/parkings/confirm/:bookingId
// @access  Private
export const confirmBooking = asyncHandler(
  async (req: IRequest, res: Response<ResponseFormat>, next: NextFunction) => {
    const { bookingId } = req.params;

    const bookingRecord = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (bookingRecord?.status === "CONFIRMED") {
      throw new ErrorResponse("Booking already confirmed", 400);
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      }),
      prisma.block.update({
        where: { id: bookingRecord?.blockId },
        data: { availableSlots: { decrement: 1 } },
      }),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Your booking confirmed. now you can parking",
    });
  }
);

// @desc    Complete for Online Booking
// @route   PUT /api/user/parkings/complete/:bookingId
// @access  Private
export const ccompleteBooking = asyncHandler(
  async (req: IRequest, res: Response<ResponseFormat>, next: NextFunction) => {
    const { bookingId } = req.params;

    const bookingRecord = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (bookingRecord?.status === "COMPLETED") {
      throw new ErrorResponse("Booking already completed", 400);
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      }),
      prisma.block.update({
        where: { id: bookingRecord?.blockId },
        data: { availableSlots: { increment: 1 } },
      }),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Your booking is complete. Thank for your parking",
    });
  }
);

// @desc    Get User Booking
// @route   GET /api/user/parkings/:bookingId
// @access  Private
export const getUserBooking = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.user?.id as string;

    const booking = await prisma.booking.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        block: {
          select: {
            id: true,
            blockName: true,
            locationId: true,
            availableSlots: true,
            totalSlots: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ErrorResponse("Booking not found", 404);
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: booking,
    });
  }
);
