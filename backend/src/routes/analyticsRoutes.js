import express from "express";
import { analytics } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, analytics);
export default router;
