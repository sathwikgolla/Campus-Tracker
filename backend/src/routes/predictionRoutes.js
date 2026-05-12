import express from "express";
import { getPrediction } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/faculty/:id", protect, getPrediction);
export default router;
