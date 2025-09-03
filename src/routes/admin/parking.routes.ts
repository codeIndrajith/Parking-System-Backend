import express from "express";
import {
  addParkingLocationController,
  getAllParkingLocationsController,
  deleteParkingLocationController,
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

export default parkingRouter;
