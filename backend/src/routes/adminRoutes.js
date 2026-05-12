import express from "express";
import {
  createAdminDepartment,
  createAdminFaculty,
  deleteAdminDepartment,
  deleteAdminFaculty,
  deleteUser,
  getAdminDashboard,
  getAdminDepartments,
  getAdminFaculty,
  getUser,
  getUsers,
  updateAdminDepartment,
  updateAdminFaculty,
  updateUser,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/dashboard", getAdminDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/faculty", getAdminFaculty);
router.post("/faculty", createAdminFaculty);
router.put("/faculty/:id", updateAdminFaculty);
router.delete("/faculty/:id", deleteAdminFaculty);
router.get("/departments", getAdminDepartments);
router.post("/departments", createAdminDepartment);
router.put("/departments/:id", updateAdminDepartment);
router.delete("/departments/:id", deleteAdminDepartment);

export default router;
