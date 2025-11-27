import express from "express";
import { protect, authorize } from "../../middlewares/authMiddleware";
import { getUserParkTrackDetails } from "../../controllers/admin/dashboard.controllers";
const dashboardRoutes = express.Router({ mergeParams: true });

dashboardRoutes
  .route("/")
  .get(protect, authorize("Admin"), getUserParkTrackDetails);

export default dashboardRoutes;
