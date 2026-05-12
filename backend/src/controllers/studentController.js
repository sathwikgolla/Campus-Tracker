import Department from "../models/Department.js";
import FacultyProfile from "../models/FacultyProfile.js";
import Favorite from "../models/Favorite.js";
import Notification from "../models/Notification.js";
import RecentSearch from "../models/RecentSearch.js";
import User from "../models/User.js";
import Timetable from "../models/Timetable.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";
import { getFacultyLiveStatus } from "../utils/liveStatus.js";

export const getStudentDashboard = asyncHandler(async (req, res) => {
  const [faculty, timetable, departmentCount, favoriteCount, recentSearchCount, recentFaculty, notifications] = await Promise.all([
    FacultyProfile.find({ isActive: true }),
    Timetable.find(),
    Department.countDocuments({ isActive: true }),
    Favorite.countDocuments({ student: req.user._id }),
    RecentSearch.countDocuments({ student: req.user._id }),
    FacultyProfile.find({ isActive: true }).sort("-updatedAt").limit(6),
    Notification.find({ user: req.user._id }).sort("-createdAt").limit(8),
  ]);
  const availableFacultyCount = faculty.filter((profile) => getFacultyLiveStatus(profile, timetable.filter((entry) => String(entry.teacherId) === String(profile.user))).status === "Available").length;
  return success(res, "Student dashboard loaded", { availableFacultyCount, departmentCount, favoriteCount, recentSearchCount, recentFaculty, notifications });
});

export const getStudentProfile = asyncHandler(async (req, res) => success(res, "Profile loaded", req.user));

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar", "rollNumber", "branch", "year", "section"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  return success(res, "Profile updated", user);
});

export const getRecentSearches = asyncHandler(async (req, res) => {
  const data = await RecentSearch.find({ student: req.user._id }).sort("-searchedAt").limit(30);
  return success(res, "Recent searches loaded", data);
});

export const clearRecentSearches = asyncHandler(async (req, res) => {
  await RecentSearch.deleteMany({ student: req.user._id });
  return success(res, "Recent searches cleared");
});
