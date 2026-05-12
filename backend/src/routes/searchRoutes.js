import express from "express";
import { clearSearchHistory, getSearchHistory } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/history", getSearchHistory);
router.delete("/history", clearSearchHistory);

export default router;
