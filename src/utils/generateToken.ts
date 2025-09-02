import jwt, { SignOptions } from "jsonwebtoken";
import { ErrorResponse } from "./errorResponse";

interface TokenPayload {
  id: string;
}

export const generateToken = (
  payload: TokenPayload,
  expiresIn: `${number}${"s" | "m" | "h" | "d"}`
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return decoded;
  } catch (error: any) {
    console.error("JWT verification failed:", error);
    throw new ErrorResponse("Not authorized to access this routes", 401);
  }
};
