import express from "express";
import { protect, authorize } from "../../middlewares/authMiddleware";
import {
  getAllUsers,
  getUserParkTrackDetails,
} from "../../controllers/admin/dashboard.controllers";
const dashboardRoutes = express.Router({ mergeParams: true });

dashboardRoutes
  .route("/")
  .get(protect, authorize("Admin"), getUserParkTrackDetails);
dashboardRoutes.route("/users").get(protect, authorize("Admin"), getAllUsers);

export default dashboardRoutes;
