import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Body parser
app.use(express.json());

// Enable CORS for all routes
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

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

// Error handler (make sure this is properly implemented)
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Only start server if not in Vercel environment
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
