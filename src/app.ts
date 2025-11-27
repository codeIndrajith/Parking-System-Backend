import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "../src/config/database";
import { errorHandler } from "./middlewares/errorMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Enable CORS for all routes
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// connectDB
connectDB();

app.use(cookieParser());

// Import routes
import authRoutes from "./routes/auth/auth.route";
import parkingRoutes from "./routes/admin/parking.routes";
import parkingBlocksRoutes from "./routes/admin/parking-blocks.routes";
import userParkingRoutes from "./routes/user/Uparking.routes";
import adminDashboardRoutes from "./routes/admin/dashboard.routes";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/parking", parkingRoutes);
app.use("/api/admin/parking/blocks", parkingBlocksRoutes);
app.use("/api/user", userParkingRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
