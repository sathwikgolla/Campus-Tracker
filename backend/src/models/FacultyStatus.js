import mongoose from "mongoose";

const facultyStatusSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile", required: true, unique: true },
  status: { type: String, enum: ["Available", "Busy", "In Class", "On Leave", "In Meeting", "Not Updated"], default: "Not Updated" },
  cabin: String,
  location: String,
  availableFrom: String,
  availableTo: String,
  customMessage: String,
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("FacultyStatus", facultyStatusSchema);
