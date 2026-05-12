import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "FacultyProfile", required: true },
  pinned: { type: Boolean, default: false },
}, { timestamps: true });

favoriteSchema.index({ student: 1, faculty: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
