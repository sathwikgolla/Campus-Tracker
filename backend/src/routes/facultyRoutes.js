import express from "express";
import { body, query } from "express-validator";
import { createFaculty, deleteFaculty, getFaculty, getFacultyById, updateFaculty } from "../controllers/facultyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.get("/", protect, [
  query("status").optional().isIn(["Available", "Busy", "In Class", "On Leave"]),
], validate, getFaculty);
router.get("/:id", protect, getFacultyById);
router.post("/", protect, authorize("admin"), [body("name").notEmpty(), body("email").isEmail(), body("department").notEmpty()], validate, createFaculty);
router.put("/:id", protect, updateFaculty);
router.delete("/:id", protect, authorize("admin"), deleteFaculty);

export default router;
