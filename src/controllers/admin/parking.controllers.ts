import { NextFunction, Response } from "express";
import { ErrorResponse } from "../../utils/errorResponse";
import asyncHandler from "../../utils/asyncHandler";

import { PrismaClient } from "../../generated/prisma";
import { IRequest } from "../../types/auth.types";
import { ResponseFormat } from "../../types/responseFormat";
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
    // Add logic to save parking location to the database
    const parkingLocation = await prisma.parkingLocation.create({
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
