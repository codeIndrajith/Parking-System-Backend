import express from "express";
import { authController } from "../../controllers/auth/auth.controller";
const router = express.Router();

router.route("/register").post(authController);

export default router;
