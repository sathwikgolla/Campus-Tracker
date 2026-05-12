import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High", "Emergency"], default: "Medium" },
  targetRole: { type: String, enum: ["all", "students", "teachers", "admin"], default: "all" },
  targetDepartment: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: Date,
}, { timestamps: true });

export default mongoose.model("Broadcast", broadcastSchema);
