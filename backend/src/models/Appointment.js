import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile", required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "AvailabilitySlot" },
  reason: { type: String, required: true },
  message: String,
  tokenNumber: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"], default: "Pending" },
  teacherResponse: String,
}, { timestamps: true });

appointmentSchema.index({ facultyId: 1, createdAt: 1 });

export default mongoose.model("Appointment", appointmentSchema);
