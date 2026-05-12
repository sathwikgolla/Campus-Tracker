import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["student", "teacher", "admin"], required: true },
  phone: { type: String, unique: true, sparse: true },
  avatar: String,
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailOtp: { type: String, select: false },
  emailOtpExpires: { type: Date, select: false },
  emailOtpAttempts: { type: Number, default: 0, select: false },
  lastOtpSentAt: { type: Date, select: false },
  lastLogin: Date,
  rollNumber: { type: String, unique: true, sparse: true },
  branch: String,
  year: String,
  section: String,
  employeeId: { type: String, unique: true, sparse: true },
  department: String,
  designation: String,
  cabin: String,
  subjects: [String],
  experience: { type: Number, default: 0 },
  adminLevel: { type: String, default: "super" },
  adminId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  if (/^\$2[aby]\$/.test(this.password)) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
