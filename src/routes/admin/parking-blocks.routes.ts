import express from "express";
import {
  addParkingBlocksController,
  getParkingBlocksController,
  deleteParkingBlockController,
  updateParkingBlockController,
} from "../../controllers/admin/parking-blocks.controllers";
import { protect, authorize } from "../../middlewares/authMiddleware";

const parkingBlocksRouter = express.Router({ mergeParams: true });

parkingBlocksRouter
  .route("/:locationId/new")
  .post(protect, authorize("Admin"), addParkingBlocksController);
parkingBlocksRouter
  .route("/:locationId")
  .get(protect, authorize("Admin"), getParkingBlocksController);
parkingBlocksRouter
  .route("/:blockId")
  .put(protect, authorize("Admin"), updateParkingBlockController);
parkingBlocksRouter
  .route("/:blockId")
  .delete(protect, authorize("Admin"), deleteParkingBlockController);

export default parkingBlocksRouter;
