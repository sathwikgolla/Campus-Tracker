import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ["Workshop", "Seminar", "Hackathon", "Exam", "Club Activity", "Announcement"], default: "Announcement" },
  date: { type: Date, required: true },
  time: String,
  venue: String,
  department: String,
  posterImage: String,
  registrationLink: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
