import express from "express";
import { createEvent, getEvents, toggleInterested } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, getEvents);
router.post("/", protect, authorize("admin", "teacher"), createEvent);
router.put("/:id/interested", protect, authorize("student"), toggleInterested);
export default router;
