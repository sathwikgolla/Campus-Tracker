import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
  login,
  logout,
  me,
  register,
  resendOtp,
  resendRegistrationOtpController,
  sendRegistrationOtpController,
  verifyOtp,
  verifyRegistrationOtpController,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later" },
});

const roleRule = body("role").isIn(["student", "teacher", "admin"]).withMessage("Role must be student, teacher, or admin");

router.post("/register", authLimiter, [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  roleRule,
], validate, register);

router.post("/send-registration-otp", authLimiter, [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  roleRule,
], validate, sendRegistrationOtpController);

router.post("/verify-otp", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Valid 6 digit OTP is required"),
], validate, verifyOtp);

router.post("/verify-registration-otp", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Valid 6 digit OTP is required"),
], validate, verifyRegistrationOtpController);

router.post("/resend-otp", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required"),
], validate, resendOtp);

router.post("/resend-registration-otp", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required"),
], validate, resendRegistrationOtpController);

router.post("/login", authLimiter, [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  roleRule,
], validate, login);

router.get("/me", protect, me);
router.post("/logout", protect, logout);

export default router;
