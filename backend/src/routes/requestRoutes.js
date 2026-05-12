import express from "express";
import { body } from "express-validator";
import { acceptRequest, completeRequest, createRequest, getMyRequests, getTeacherRequests, rejectRequest } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("student"), [
  body("teacherId").notEmpty(),
  body("facultyProfileId").notEmpty(),
  body("reason").notEmpty(),
  body("requestedTime").notEmpty(),
], validate, createRequest);
router.get("/my", protect, authorize("student"), getMyRequests);
router.get("/teacher", protect, authorize("teacher"), getTeacherRequests);
router.put("/:id/accept", protect, authorize("teacher"), acceptRequest);
router.put("/:id/reject", protect, authorize("teacher"), rejectRequest);
router.put("/:id/complete", protect, authorize("teacher"), completeRequest);

export default router;
