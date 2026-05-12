import express from "express";
import { clearRecentSearches, getRecentSearches, getStudentDashboard, getStudentProfile, updateStudentProfile } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/dashboard", getStudentDashboard);
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/recent-searches", getRecentSearches);
router.delete("/recent-searches", clearRecentSearches);

export default router;
