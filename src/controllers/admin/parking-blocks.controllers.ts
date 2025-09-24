import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { IRequest } from "../../types/auth.types";
import { ResponseFormat } from "../../types/responseFormat";
import { ErrorResponse } from "../../utils/errorResponse";
import { PrismaClient } from "@prisma/client";
const prisma: any = new PrismaClient();

// @desc     Add Parking Blocks to a Parking Location
// @route    POST /api/admin/parking/blocks/:locationId/new
// @access   Private (Admin)
export const addParkingBlocksController = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    newt: NextFunction
  ): Promise<void> => {
    const { locationId } = req.params;
    const location = await prisma.parkingLocation.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      throw new ErrorResponse("Parking location not found", 404);
    }
    const { blockName, totalSlots } = req.body;
    if (!blockName || !totalSlots) {
      throw new ErrorResponse("Please provide blockName and totalSlots", 400);
    }
    // Add logic to save parking blocks to the database
    await prisma.block.create({
      data: {
        blockName,
        totalSlots,
        availableSlots: totalSlots,
        locationId,
      },
    });
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Parking block added successfully",
    });
  }
);

// @desc     Get All Blocks for a specific Parking Location
// @route    GET /api/admin/parking/blocks/:locationId
// @access   Private (Admin)
export const getParkingBlocksController = asyncHandler(
  async (
    req: Request,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { locationId } = req.params;
    const location = await prisma.parkingLocation.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      throw new ErrorResponse("Parking location not found", 404);
    }
    const blocks = await prisma.block.findMany({
      where: { locationId },
      include: { parkingLocation: true },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: blocks,
    });
  }
);

// @desc     Update Parking Block
// @route    PUT /api/admin/parking/blocks/:blockId
// @access   Private (Admin)
export const updateParkingBlockController = asyncHandler(
  async (
    req: Request,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { blockId } = req.params;
    const block = await prisma.block.findUnique({
      where: { id: blockId },
    });
    if (!block) {
      throw new ErrorResponse("Parking block not found", 404);
    }
    const { blockName, totalSlots } = req.body;
    if (!blockName && !totalSlots) {
      throw new ErrorResponse(
        "Please provide blockName or totalSlots to update",
        400
      );
    }
    const updatedData: any = {};
    if (blockName) updatedData.blockName = blockName;
    if (totalSlots) {
      updatedData.totalSlots = totalSlots;
      // Adjust available slots accordingly
      const slotDifference = totalSlots - block.totalSlots;
      updatedData.availableSlots = block.availableSlots + slotDifference;
      if (updatedData.availableSlots < 0) updatedData.availableSlots = 0; // Prevent negative available slots
    }
    await prisma.block.update({
      where: { id: blockId },
      data: updatedData,
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Parking block updated successfully",
    });
  }
);

// @desc     Delete Parking Block
// @route    DELETE /api/admin/parking/blocks/:blockId
// @access   Private (Admin)
export const deleteParkingBlockController = asyncHandler(
  async (
    req: Request,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const { blockId } = req.params;
    const block = await prisma.block.findUnique({
      where: { id: blockId },
    });
    if (!block) {
      throw new ErrorResponse("Parking block not found", 404);
    }
    await prisma.block.delete({ where: { id: blockId } });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Parking block deleted successfully",
    });
  }
);


    