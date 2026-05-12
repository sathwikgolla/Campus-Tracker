import express from "express";
import { createDepartment, deleteDepartment, getDepartment, getDepartments, updateDepartment } from "../controllers/departmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getDepartments);
router.get("/:id", protect, getDepartment);
router.post("/", protect, authorize("admin"), createDepartment);
router.put("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

export default router;
