import express from "express";
import { body } from "express-validator";
import { createSlot, deleteSlot, getSlots, getTeacherDashboard, getTeacherProfile, updateSlot, updateStatus, updateTeacherProfile } from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();
router.use(protect, authorize("teacher"));

router.get("/dashboard", getTeacherDashboard);
router.put("/status", [body("status").isIn(["Available", "Busy", "In Class", "On Leave", "In Meeting", "Not Updated"])], validate, updateStatus);
router.get("/slots", getSlots);
router.post("/slots", [body("date").notEmpty(), body("startTime").notEmpty(), body("endTime").notEmpty(), body("type").notEmpty()], validate, createSlot);
router.put("/slots/:id", updateSlot);
router.delete("/slots/:id", deleteSlot);
router.get("/profile", getTeacherProfile);
router.put("/profile", updateTeacherProfile);

export default router;
