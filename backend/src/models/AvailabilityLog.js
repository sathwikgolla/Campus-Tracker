import mongoose from "mongoose";

const availabilityLogSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile", required: true },
  status: { type: String, required: true },
  cabin: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("AvailabilityLog", availabilityLogSchema);
