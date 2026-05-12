import express from "express";
import { createTimetable, deleteTimetable, updateTimetable } from "../controllers/advancedController.js";
import { getTeacherTimetable, getTimetableEntries } from "../controllers/timetableController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, getTimetableEntries);
router.get("/teacher/:teacherId", protect, getTeacherTimetable);
router.post("/", protect, authorize("admin"), createTimetable);
router.put("/:id", protect, authorize("admin"), updateTimetable);
router.delete("/:id", protect, authorize("admin"), deleteTimetable);
export default router;
