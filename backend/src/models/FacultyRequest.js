import mongoose from "mongoose";

const facultyRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  facultyProfile: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile", required: true },
  reason: { type: String, required: true },
  message: String,
  requestedTime: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Completed"], default: "Pending" },
  teacherResponse: String,
  respondedAt: Date,
}, { timestamps: true });

export default mongoose.model("FacultyRequest", facultyRequestSchema);
