import express from "express";
import { getParkings } from "../../controllers/user/Uparking.controller";

const router = express.Router();

router.route("/parkings").get(getParkings);

export default router;
