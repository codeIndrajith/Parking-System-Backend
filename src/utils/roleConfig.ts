import { Role } from "../generated/prisma";
import { ErrorResponse } from "./errorResponse";

export function toRole(value: string): Role {
  switch (value) {
    case "Admin":
      return Role.Admin;
    case "User":
      return Role.User;
    default:
      throw new ErrorResponse(`Invalid role value: ${value}`, 400);
  }
}
