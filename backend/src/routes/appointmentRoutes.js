import express from "express";
import { acceptAppointment, cancelAppointment, completeAppointment, createAppointment, getMyAppointments, rejectAppointment } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", getMyAppointments);
router.post("/", authorize("student"), createAppointment);
router.put("/:id/accept", authorize("teacher"), acceptAppointment);
router.put("/:id/reject", authorize("teacher"), rejectAppointment);
router.put("/:id/complete", authorize("teacher"), completeAppointment);
router.put("/:id/cancel", authorize("student"), cancelAppointment);
export default router;
