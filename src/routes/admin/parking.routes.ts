import express from "express";
import {
  addParkingLocationController,
  getAllParkingLocationsController,
  deleteParkingLocationController,
  updateParkingLocationController,
} from "../../controllers/admin/parking.controllers";
import { protect, authorize } from "../../middlewares/authMiddleware";

export const parkingRouter = express.Router();

parkingRouter
  .route("/new")
  .post(protect, authorize("Admin"), addParkingLocationController);
parkingRouter
  .route("/")
  .get(protect, authorize("Admin"), getAllParkingLocationsController);
parkingRouter
  .route("/:id")
  .delete(protect, authorize("Admin"), deleteParkingLocationController);
parkingRouter
  .route("/:id")
  .put(protect, authorize("Admin"), updateParkingLocationController);

export default parkingRouter;
