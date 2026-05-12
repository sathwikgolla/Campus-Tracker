import express from "express";
import { getTheme, updateTheme } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getTheme);
router.put("/", protect, updateTheme);
export default router;
