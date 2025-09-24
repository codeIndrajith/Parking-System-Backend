import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
import { connectDB } from "./config/database";
import { errorHandler } from "./middlewares/errorMiddleware";

const app = express();
const PORT = process.env.PORT || 4000;

// Body parser
app.use(express.json());

connectDB();

// Enable CORS for all routes
app.use(cors());

// Cookie parser
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Import routes
import authRoutes from "./routes/auth/auth.route";
import parkingRoutes from "./routes/admin/parking.routes";
import parkingBlocksRoutes from "./routes/admin/parking-blocks.routes";
import userParkingRoutes from "./routes/user/Uparking.routes";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/parking", parkingRoutes);
app.use("/api/admin/parking/blocks", parkingBlocksRoutes);
app.use("/api/user", userParkingRoutes);

app.use(errorHandler);

export default app;
