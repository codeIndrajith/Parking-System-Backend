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

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  // Set cookie
  res.cookie("token", token, cookieOptions);

  // Send response with token only (no cookies)
  res.status(statusCode).json({
    success: true,
    statusCode,
    user,
    token,
  });
};
