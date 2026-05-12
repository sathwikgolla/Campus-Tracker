import mongoose from "mongoose";

const recentSearchSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  keyword: String,
  filters: {
    department: String,
    status: String,
    location: String,
  },
  matchedCount: { type: Number, default: 0 },
  searchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("RecentSearch", recentSearchSchema);
