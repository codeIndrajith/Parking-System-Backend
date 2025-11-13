import express from "express";
import {
  authController,
  authUserController,
  authUserCredUpdateController,
  loginController,
  logoutController,
} from "../../controllers/auth/auth.controller";
import { protect } from "../../middlewares/authMiddleware";
const router = express.Router();

router.route("/register").post(authController);
router.route("/login").post(loginController);
router.route("/logout").get(logoutController);
router.route("/user").get(protect, authUserController);
router.route("/user-update").put(protect, authUserCredUpdateController);

export default router;
