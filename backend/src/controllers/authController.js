import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import FacultyProfile from "../models/FacultyProfile.js";
import PendingRegistration from "../models/PendingRegistration.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";
import generateToken from "../utils/generateToken.js";
import { otpEmailTemplate, sendEmail } from "../utils/sendEmail.js";

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function setTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function makeOtp() {
  return String(crypto.randomInt(100000, 999999));
}

async function sendRegistrationOtp(pending) {
  const otp = makeOtp();
  pending.otp = await bcrypt.hash(otp, 10);
  pending.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  pending.otpAttempts = 0;
  pending.lastOtpSentAt = new Date();
  await pending.save();
  await sendEmail({
    to: pending.email,
    subject: "CampusTracker OTP Verification",
    text: `Your CampusTracker verification OTP is: ${otp}. This OTP will expire in 10 minutes.`,
    html: otpEmailTemplate(otp),
  });
}

async function duplicateMessage({ email, phone, rollNumber, employeeId, adminId }, excludeId = null) {
  const checks = [
    ["email", email, "Email already registered"],
    ["phone", phone, "Phone number already registered"],
    ["rollNumber", rollNumber, "Roll number already registered"],
    ["employeeId", employeeId, "Employee ID already registered"],
    ["adminId", adminId, "Admin ID already registered"],
  ];
  for (const [field, value, message] of checks) {
    if (!value) continue;
    const query = { [field]: value };
    if (excludeId) query._id = { $ne: excludeId };
    if (await User.exists(query)) return message;
  }
  return null;
}

async function clearLegacyUnverifiedUsers({ email, phone, rollNumber, employeeId, adminId }) {
  const clauses = [
    email && { email },
    phone && { phone },
    rollNumber && { rollNumber },
    employeeId && { employeeId },
    adminId && { adminId },
  ].filter(Boolean);

  if (!clauses.length) return;
  const legacyUsers = await User.find({ isEmailVerified: false, $or: clauses }).select("_id");
  if (!legacyUsers.length) return;

  const legacyIds = legacyUsers.map((user) => user._id);
  await FacultyProfile.deleteMany({ user: { $in: legacyIds } });
  await User.deleteMany({ _id: { $in: legacyIds }, isEmailVerified: false });
}

export const register = asyncHandler(async (req, res) => {
  return sendRegistrationOtpController(req, res);
});

export const sendRegistrationOtpController = asyncHandler(async (req, res) => {
  const { role, email, password, adminSecretCode, ...payload } = req.body;
  if (role === "admin" && adminSecretCode !== (process.env.ADMIN_SECRET_CODE || "CAMPUS_ADMIN_2026")) {
    return res.status(403).json({ success: false, message: "Invalid admin secret code" });
  }

  await clearLegacyUnverifiedUsers({ email, phone: payload.phone, rollNumber: payload.rollNumber, employeeId: payload.employeeId, adminId: payload.adminId });
  const duplicate = await duplicateMessage({ email, phone: payload.phone, rollNumber: payload.rollNumber, employeeId: payload.employeeId, adminId: payload.adminId });
  if (duplicate) return res.status(409).json({ success: false, message: duplicate });

  const hashedPassword = await bcrypt.hash(password, 12);
  const pendingPayload = {
    ...payload,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date(),
  };
  const pending = await PendingRegistration.findOneAndUpdate(
    { email: String(email).toLowerCase() },
    pendingPayload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).select("+otp +otpExpiresAt +otpAttempts +lastOtpSentAt +password");

  await sendRegistrationOtp(pending);
  return res.status(200).json({ success: true, message: "OTP sent successfully", data: { email: pending.email } });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  return verifyRegistrationOtpController(req, res);
});

export const verifyRegistrationOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const pending = await PendingRegistration.findOne({ email }).select("+otp +otpExpiresAt +otpAttempts +password");
  if (!pending) return res.status(404).json({ success: false, message: "Registration session expired. Please register again." });
  if (!pending.otp || !pending.otpExpiresAt || pending.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP" });
  }
  if (pending.otpAttempts >= 5) {
    return res.status(429).json({ success: false, message: "Maximum OTP attempts exceeded. Please resend OTP" });
  }

  const ok = await bcrypt.compare(String(otp), pending.otp);
  if (!ok) {
    pending.otpAttempts += 1;
    await pending.save();
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  const uniqueFields = {
    email: pending.email,
    phone: pending.phone,
    rollNumber: pending.rollNumber,
    employeeId: pending.employeeId,
    adminId: pending.adminId,
  };
  await clearLegacyUnverifiedUsers(uniqueFields);
  const duplicate = await duplicateMessage(uniqueFields);
  if (duplicate) return res.status(409).json({ success: false, message: duplicate });

  const user = await User.create({
    name: pending.name,
    email: pending.email,
    password: pending.password,
    role: pending.role,
    phone: pending.phone,
    rollNumber: pending.rollNumber,
    branch: pending.branch,
    year: pending.year,
    section: pending.section,
    employeeId: pending.employeeId,
    department: pending.department,
    designation: pending.designation,
    cabin: pending.cabin,
    adminId: pending.adminId,
    adminLevel: pending.adminLevel,
    isEmailVerified: true,
  });

  if (user.role === "teacher") {
    await FacultyProfile.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      cabin: user.cabin || "Cabin not assigned",
      location: user.cabin || "Cabin not assigned",
      subjects: user.subjects,
      experience: user.experience,
      availableTime: "No timetable available",
      status: "Not Updated",
    });
  }

  await PendingRegistration.deleteOne({ _id: pending._id });
  return success(res, "Email verified successfully. Please login.");
});

export const resendOtp = asyncHandler(async (req, res) => {
  return resendRegistrationOtpController(req, res);
});

export const resendRegistrationOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const pending = await PendingRegistration.findOne({ email }).select("+otp +otpExpiresAt +otpAttempts +lastOtpSentAt +password");
  if (!pending) return res.status(404).json({ success: false, message: "Registration session expired. Please register again." });
  if (pending.lastOtpSentAt && Date.now() - pending.lastOtpSentAt.getTime() < 60 * 1000) {
    return res.status(429).json({ success: false, message: "Please wait 60 seconds before requesting another OTP" });
  }
  await sendRegistrationOtp(pending);
  return success(res, "OTP resent successfully");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (user.role !== role) {
    return res.status(403).json({ success: false, message: "Invalid role selected for this account" });
  }
  if (!user.isEmailVerified) {
    return res.status(403).json({ success: false, message: "Please verify your email before login" });
  }
  if (!user.isActive) return res.status(403).json({ success: false, message: "Account is disabled" });

  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user);
  setTokenCookie(res, token);
  return res.json({ success: true, message: "Login successful", token, user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req, res) => success(res, "User loaded", sanitizeUser(req.user)));

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return success(res, "Logout successful");
});
