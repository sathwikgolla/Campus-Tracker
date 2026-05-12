import mongoose from "mongoose";

const themePreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  theme: { type: String, enum: ["Dark Neon", "Light Minimal", "Campus Blue", "Purple SaaS", "Cyber Glow"], default: "Dark Neon" },
}, { timestamps: true });

export default mongoose.model("ThemePreference", themePreferenceSchema);
