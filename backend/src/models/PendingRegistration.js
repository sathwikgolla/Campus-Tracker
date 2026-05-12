import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "teacher", "admin"], required: true },
  phone: String,
  rollNumber: String,
  branch: String,
  year: String,
  section: String,
  employeeId: String,
  department: String,
  designation: String,
  cabin: String,
  adminId: String,
  adminLevel: { type: String, default: "super" },
  otp: { type: String, required: true, select: false },
  otpExpiresAt: { type: Date, required: true, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
  lastOtpSentAt: { type: Date, default: Date.now, select: false },
  createdAt: { type: Date, default: Date.now, expires: 15 * 60 },
});

export default mongoose.model("PendingRegistration", pendingRegistrationSchema);
