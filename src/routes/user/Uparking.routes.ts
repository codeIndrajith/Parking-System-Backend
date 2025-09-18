import express from "express";
import {
  bookParking,
  ccompleteBooking,
  confirmBooking,
  getBlock,
  getParkings,
  getUserBooking,
  payForBooking,
} from "../../controllers/user/Uparking.controller";
import { protect } from "../../middlewares/authMiddleware";

const router = express.Router();

router.route("/parkings").get(getParkings);
router.route("/block/:id").get(getBlock);
router.route("/parkings").post(protect, bookParking);
router.route("/parkings/pay/:bookingId").put(protect, payForBooking);
router.route("/parkings/confirm/:bookingId").put(protect, confirmBooking);
router.route("/parkings/complete/:bookingId").put(protect, ccompleteBooking);
router.route("/parkings/:bookingId").get(protect, getUserBooking);

export default router;
