import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ["Available", "Booked", "Cancelled"], default: "Available" },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: String,
}, { timestamps: true });

export default mongoose.model("AvailabilitySlot", availabilitySlotSchema);
