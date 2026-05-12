import express from "express";
import { getLiveStatuses, updateLiveStatus } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, getLiveStatuses);
router.put("/", protect, authorize("teacher", "admin"), updateLiveStatus);
export default router;
