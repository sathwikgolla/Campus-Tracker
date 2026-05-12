import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  branch: String,
  year: String,
  section: String,
  date: { type: Date, required: true },
  period: String,
}, { timestamps: true });

export default mongoose.model("AttendanceSession", attendanceSessionSchema);
