import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
import { connectDB } from "./config/database";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
