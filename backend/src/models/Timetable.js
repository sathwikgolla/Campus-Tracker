import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  ownerRole: { type: String, enum: ["teacher", "student"], required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teacherName: String,
  department: String,
  branch: String,
  year: String,
  section: String,
  day: { type: String, required: true },
  period: String,
  subject: { type: String, required: true },
  room: String,
  startTime: String,
  endTime: String,
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Timetable", timetableSchema);
