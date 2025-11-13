import express from "express";
import {
  addParkingLocationController,
  getAllParkingLocationsController,
  deleteParkingLocationController,
  updateParkingLocationController,
  completeBooking,
  getUsersBookingDetails,
  currentDateParkedVehicles,
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
parkingRouter.route("/complete/:bookingId").put(protect, completeBooking);
parkingRouter
  .route("/user-parkings")
  .get(protect, authorize("Admin"), getUsersBookingDetails);
parkingRouter
  .route("/parking-vehicles")
  .get(protect, authorize("Admin"), currentDateParkedVehicles);

export default parkingRouter;
