import Favorite from "../models/Favorite.js";
import FacultyProfile from "../models/FacultyProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ student: req.user._id }).populate("faculty");
  return success(res, "Favorites loaded", favorites);
});

export const addFavorite = asyncHandler(async (req, res) => {
  const faculty = await FacultyProfile.findById(req.params.facultyId);
  if (!faculty) return res.status(404).json({ success: false, message: "Faculty profile not found" });
  await Favorite.findOneAndUpdate(
    { student: req.user._id, faculty: faculty._id },
    { student: req.user._id, faculty: faculty._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const favoriteCount = await Favorite.countDocuments({ student: req.user._id });
  return success(res, "Favorite added", { favoriteCount });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.findOneAndDelete({ student: req.user._id, faculty: req.params.facultyId });
  const favoriteCount = await Favorite.countDocuments({ student: req.user._id });
  return success(res, "Favorite removed", { favoriteCount });
});
