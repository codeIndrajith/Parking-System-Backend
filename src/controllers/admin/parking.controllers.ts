import { NextFunction, Response } from "express";
import { ErrorResponse } from "../../utils/errorResponse";
import asyncHandler from "../../utils/asyncHandler";
import { IRequest } from "../../types/auth.types";
import { ResponseFormat } from "../../types/responseFormat";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// @desc     Add Parking Location
// @route    POST /api/admin/parking/new
// @access   Private (Admin)
export const addParkingLocationController = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { name, address } = req.body;
    if (!name || !address) {
      throw new ErrorResponse("Please provide name and address", 400);
    }

    const existingLocation = await prisma.parkingLocation.findFirst();

    if (existingLocation) {
      throw new ErrorResponse(
        "A parking location already exists. Only one parking location is allowed.",
        400
      );
    }

    await prisma.parkingLocation.create({
      data: {
        name,
        address,
        createdBy: req.user?.id || "unknown",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Parking location added successfully",
    });
  }
);

// @desc     Get All Parking Locations
// @route    GET /api/admin/parking
// @access   Private (Admin)

export const getAllParkingLocationsController = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const parkingLocations = await prisma.parkingLocation.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: parkingLocations,
    });
  }
);

// @desck    Update Parking Location
// @route    PUT /api/admin/parking/:id
// @access   Private (Admin)
export const updateParkingLocationController = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const parkingLocation = await prisma.parkingLocation.findUnique({
      where: { id },
    });
    if (!parkingLocation) {
      throw new ErrorResponse("Parking location not found", 404);
    }
    const { name, address } = req.body;
    if (!name && !address) {
      throw new ErrorResponse("Please provide name or address to update", 400);
    }
    const updatedData: any = { updatedAt: new Date() };
    if (name) updatedData.name = name;
    if (address) updatedData.address = address;
    await prisma.parkingLocation.update({
      where: { id },
      data: updatedData,
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Parking location updated successfully",
    });
  }
);

// @desc     Delete Parking Location
// @route    DELETE /api/admin/parking/:id
// @access   Private (Admin)
export const deleteParkingLocationController = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const parkingLocation = await prisma.parkingLocation.findUnique({
      where: { id },
    });
    if (!parkingLocation) {
      throw new ErrorResponse("Parking location not found", 404);
    }
    await prisma.parkingLocation.delete({ where: { id } });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Parking location deleted successfully",
      data: [],
    });
  }
);

// @desc    Complete for Online Booking
// @route   PUT /api/user/parkings/complete/:bookingId
// @access  Private
export const completeBooking = asyncHandler(
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

    await prisma.$transaction(async (tx: any) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      });

      await tx.block.update({
        where: { id: bookingRecord?.blockId },
        data: { availableSlots: { increment: 1 } },
      });
      await tx.slot.update({
        where: { id: bookingRecord?.slotId },
        data: { isOccupied: false },
      });
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Your booking is complete. Thank for your parking",
    });
  }
);

// @desc    Get Users Booking
// @route   GET /api/admin/parkings
// @access  Private
export const getUsersBookingDetails = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const booking = await prisma.booking.findMany({
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
        slot: true,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: booking ?? [],
    });
  }
);

// @desc    Get Parking Vehicle selected the day
// @route   GET /api/admin/parking-vhicles
// @access  Private
export const currentDateParkedVehicles = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
      include: {
        block: false,
        slot: false,
      },
    });

    const vehicles = await Promise.all(
      bookings.map(async (booking) => {
        const vehicle = await prisma.vehicle.findFirst({
          where: {
            userId: booking.userId,
          },
          select: {
            brand: true,
            model: true,
            color: true,
            plateNo: true,
          },
        });

        return {
          bookingId: booking.id,
          userId: booking.userId,
          vehicle,
        };
      })
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: vehicles ?? [],
    });
  }
);
