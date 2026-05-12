import express from "express";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/", getFavorites);
router.post("/:facultyId", addFavorite);
router.delete("/:facultyId", removeFavorite);

export default router;
