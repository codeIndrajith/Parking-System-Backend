import { Request } from "express";
import { Role } from "../utils/roleConfig";

export interface Vehicle {
  id: string;
  plateNo: string;
  model: string;
  brand: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  vehicles?: Vehicle[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequest extends Request {
  user?: Omit<User, "password">;
}

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  user: Omit<User, "password">;
  token: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role: Role;
  vehicles?: Omit<Vehicle, "id">[];
}

export interface AuthRequest extends Request {
  body: LoginRequestBody | RegisterRequestBody;
}
