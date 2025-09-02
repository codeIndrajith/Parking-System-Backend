import express from "express";
import dotenv from "dotenv";
import cors from "cors";

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

// Import routes
import authRoutes from "./routes/auth/auth.route";

// Mount routes
app.use("/api/auth", authRoutes);

// Handle errors
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
