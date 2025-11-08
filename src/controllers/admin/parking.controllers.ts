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
