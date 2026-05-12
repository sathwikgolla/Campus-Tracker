import mongoose from "mongoose";

const facultyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  department: { type: String, required: true },
  designation: String,
  cabin: String,
  location: String,
  currentLocation: String,
  subjects: [String],
  experience: { type: Number, default: 0 },
  avatar: String,
  status: { type: String, enum: ["Available", "Busy", "In Class", "On Leave", "In Meeting", "Not Updated"], default: "Not Updated" },
  availableTime: String,
  manualStatus: { type: String, enum: ["Available", "Busy", "In Class", "On Leave", "In Meeting", "Not Updated", null], default: null },
  manualLocation: String,
  manualAvailableTime: String,
  lastUpdated: { type: Date, default: Date.now },
  profileViews: { type: Number, default: 0 },
  studentSearchCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

facultyProfileSchema.index({ name: "text", department: "text", cabin: "text", location: "text", subjects: "text", email: "text" });

export default mongoose.model("FacultyProfile", facultyProfileSchema);
