import express from "express";
import { createAttendanceSession, getAttendance, submitAttendance } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, getAttendance);
router.post("/sessions", protect, authorize("teacher"), createAttendanceSession);
router.post("/sessions/:sessionId/records", protect, authorize("teacher"), submitAttendance);
export default router;
