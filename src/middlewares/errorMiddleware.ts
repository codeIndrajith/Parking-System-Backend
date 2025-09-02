import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../utils/errorResponse";
import { ResponseFormat } from "../types/responseFormat";

interface ErrorWithCode extends Error {
  code?: string;
  statusCode?: number;
  meta?: any;
}

export const errorHandler = (
  err: ErrorWithCode,
  req: Request,
  res: Response<ResponseFormat>,
  next: NextFunction
) => {
  let error: ErrorWithCode | ErrorResponse = { ...err };
  error.message = err.message;

  console.log("Error:", error);

  if (error.name === "PrismaClientKnownRequestError") {
    switch (error.code) {
      case "P1001":
        error = new ErrorResponse(
          "Cannot reach the database server. Please ensure it is running and accessible.",
          503
        );
        break;
      case "P2002": {
        const targetFields = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[]).join(", ")
          : "fields";
        error = new ErrorResponse(`Duplicate entry for ${targetFields}`, 409);
        break;
      }
      case "P2025":
        error = new ErrorResponse("Record not found", 404);
        break;
      case "P2003":
        error = new ErrorResponse("Foreign key constraint failed", 400);
        break;
      case "P2016":
        error = new ErrorResponse("Required field missing", 400);
        break;
      default:
        if (
          error.message.includes("Argument") &&
          error.message.includes("is missing")
        ) {
          const match = /Argument `(.+?)` is missing/.exec(error.message);
          const missingField = match?.[1] || "field";
          error = new ErrorResponse(
            `Missing required field: ${missingField}`,
            400
          );
        } else {
          error = new ErrorResponse("Database operation failed", 500);
        }
    }
  } else if (error.name === "PrismaClientValidationError") {
    error = new ErrorResponse("Invalid data format provided", 400);
  }

  res.status(error.statusCode ?? 500).json({
    success: false,
    statusCode: error.statusCode ?? 500,
    error: error.message || "Server Error",
  });
};
