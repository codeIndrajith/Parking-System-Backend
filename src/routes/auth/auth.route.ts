import express from "express";
import {
  authController,
  loginController,
  logoutController,
} from "../../controllers/auth/auth.controller";
const router = express.Router();

router.route("/register").post(authController);
router.route("/login").post(loginController);
router.route("/logout").get(logoutController);

export default router;
