import express from "express";
import { commentForumPost, createForumPost, getForumPosts, likeForumPost, moderateForumPost } from "../controllers/advancedController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", protect, getForumPosts);
router.post("/", protect, authorize("student", "teacher"), createForumPost);
router.put("/:id/like", protect, likeForumPost);
router.post("/:id/comments", protect, commentForumPost);
router.put("/:id/moderate", protect, authorize("admin"), moderateForumPost);
export default router;
