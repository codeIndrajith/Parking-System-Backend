// @desc     Get user parking tracking data
// @route    GET /api/admin/dashboard
// @access   Private (Admin)

import { PrismaClient } from "@prisma/client";
import { IRequest } from "../../types/auth.types";
import { ResponseFormat } from "../../types/responseFormat";
import asyncHandler from "../../utils/asyncHandler";
import { Response, NextFunction } from "express";

const prisma: any = new PrismaClient();

export const getUserParkTrackDetails = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    next: NextFunction
  ): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      date,
      userId,
      bookingType,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (date) where.date = date;
    if (userId) where.userId = userId;
    if (bookingType) where.bookingType = bookingType;

    const [bookings, totalBookings] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          block: {
            select: {
              id: true,
              blockName: true,
              totalSlots: true,
              availableSlots: true,
              isFull: true,
              vehicleType: true,
            },
          },
          slot: {
            select: { id: true, isOccupied: true, slotNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    const [totalStats, statusStats, paymentStats] = await Promise.all([
      prisma.booking.aggregate({
        _count: { id: true },
        _sum: { amount: true, duration: true },
      }),

      prisma.booking.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      prisma.booking.groupBy({
        by: ["paymentStatus"],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    // 🔥 Remove underscores from final API response
    const formattedStatusStats = statusStats.map((s: any) => ({
      status: s.status,
      count: s._count.id,
    }));

    const formattedPaymentStats = paymentStats.map((p: any) => ({
      paymentStatus: p.paymentStatus,
      count: p._count.id,
      revenue: p._sum.amount ?? 0,
    }));

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        bookings,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalBookings / limitNum),
          totalItems: totalBookings,
          itemsPerPage: limitNum,
        },
        statistics: {
          total: {
            bookings: totalStats._count.id,
            revenue: totalStats._sum.amount ?? 0,
            totalDuration: totalStats._sum.duration ?? 0,
          },
          byStatus: formattedStatusStats,
          byPaymentStatus: formattedPaymentStats,
        },
      },
    });
  }
);

// @desc     Get all users
// @route    GET /api/admin/dashboard/users
// @access   Private (Admin)

export const getAllUsers = asyncHandler(
  async (
    req: IRequest,
    res: Response<ResponseFormat>,
    newt: NextFunction
  ): Promise<void> => {
    const allUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ["Student", "CivilStaff", "AcademicStaff", "MilitaryStaff"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res
      .status(200)
      .json({ success: true, statusCode: 200, data: allUsers ?? [] });
  }
);
