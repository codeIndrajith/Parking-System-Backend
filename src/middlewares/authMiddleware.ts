import { ErrorResponse } from "../utils/errorResponse";
import { NextFunction, Response } from "express";
import { verifyToken } from "../utils/generateToken";
import { IRequest } from "../types/auth.types";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

// Protect Routes
export const protect = async (
  req: IRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string = "";

  const authHeader = (req.headers as { authorization?: string }).authorization;

  if (authHeader?.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  //   Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not Authorized to access this route", 401));
  }

  const { id } = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const { password, ...userWithoutPassword } = user;
  req.user = userWithoutPassword;
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: IRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user?.role)) {
      return next(
        new ErrorResponse(
          `${req.user?.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
