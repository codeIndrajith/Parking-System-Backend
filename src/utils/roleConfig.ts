import { ErrorResponse } from "./errorResponse";

export enum Role {
  Admin = "Admin",
  User = "User",
}

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
