import { Response } from "express";
import { generateToken } from "../utils/generateToken";
import { AuthResponse } from "../types/auth.types";

export const sendTokenResponse = (
  user: any,
  statusCode: number,
  res: Response<AuthResponse>
): void => {
  // Create JWT token
  const token = generateToken(
    {
      id: `${user.id}`,
    },
    "1d"
  );

  // Send response with token only (no cookies)
  res.status(statusCode).json({
    success: true,
    statusCode,
    user,
    token,
  });
};
