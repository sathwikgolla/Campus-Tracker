import AvailabilitySlot from "../models/AvailabilitySlot.js";
import Favorite from "../models/Favorite.js";
import FacultyProfile from "../models/FacultyProfile.js";
import FacultyRequest from "../models/FacultyRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emit } from "../config/socket.js";
import Timetable from "../models/Timetable.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";
import { getFacultyLiveStatus } from "../utils/liveStatus.js";

export const getTeacherDashboard = asyncHandler(async (req, res) => {
  const profile = await FacultyProfile.findOne({ user: req.user._id });
  const [studentRequestsCount, openSlotsCount, unreadMessagesCount, requests, slots, notifications, timetable] = await Promise.all([
    FacultyRequest.countDocuments({ teacher: req.user._id, status: "Pending" }),
    AvailabilitySlot.countDocuments({ teacher: req.user._id, status: "Available" }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    FacultyRequest.find({ teacher: req.user._id }).populate("student", "name email rollNumber branch").sort("-createdAt").limit(10),
    AvailabilitySlot.find({ teacher: req.user._id }).sort("date startTime").limit(10),
    Notification.find({ user: req.user._id }).sort("-createdAt").limit(10),
    Timetable.find({ teacherId: req.user._id }).sort("day startTime"),
  ]);
  const liveStatus = getFacultyLiveStatus(profile, timetable);
  return success(res, "Teacher dashboard loaded", {
    teacher: req.user,
    currentStatus: liveStatus.status,
    currentCabin: profile?.cabin || "Cabin not assigned",
    currentLocation: liveStatus.location,
    availableTime: liveStatus.availableTime,
    currentClass: liveStatus.subject,
    timetable,
    studentRequestsCount,
    openSlotsCount,
    unreadMessagesCount,
    profileViews: profile?.profileViews || 0,
    requests,
    slots,
    notifications,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, cabin, location, availableTime, clearManualStatus = false } = req.body;
  const updates = clearManualStatus
    ? {
        manualStatus: null,
        manualLocation: "",
        manualAvailableTime: "",
        lastUpdated: new Date(),
      }
    : {
        status,
        cabin,
        location,
        availableTime,
        manualStatus: status,
        manualLocation: location || cabin,
        manualAvailableTime: availableTime,
        lastUpdated: new Date(),
      };
  const profile = await FacultyProfile.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const favorites = await Favorite.find({ faculty: profile._id }).select("student");
  if (favorites.length) {
    await Notification.insertMany(favorites.map((favorite) => ({
      user: favorite.student,
      title: "Faculty Status Updated",
      message: `${profile.name} is now ${profile.status} at ${profile.cabin}`,
      type: "statusUpdate",
    })));
  }
  emit("facultyStatusUpdated", { facultyId: profile._id, status: profile.status, cabin: profile.cabin, location: profile.location, availableTime: profile.availableTime });
  return success(res, "Availability updated", profile);
});

export const getSlots = asyncHandler(async (req, res) => success(res, "Slots loaded", await AvailabilitySlot.find({ teacher: req.user._id }).sort("date startTime")));
export const createSlot = asyncHandler(async (req, res) => success(res, "Slot created", await AvailabilitySlot.create({ ...req.body, teacher: req.user._id }), 201));
export const updateSlot = asyncHandler(async (req, res) => success(res, "Slot updated", await AvailabilitySlot.findOneAndUpdate({ _id: req.params.id, teacher: req.user._id }, req.body, { new: true })));
export const deleteSlot = asyncHandler(async (req, res) => {
  await AvailabilitySlot.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
  return success(res, "Slot deleted");
});

export const getTeacherProfile = asyncHandler(async (req, res) => {
  const profile = await FacultyProfile.findOne({ user: req.user._id });
  return success(res, "Teacher profile loaded", { user: req.user, facultyProfile: profile });
});

export const updateTeacherProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar", "department", "designation", "cabin", "subjects", "experience"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  const profile = await FacultyProfile.findOneAndUpdate({ user: req.user._id }, updates, { new: true, upsert: true });
  return success(res, "Teacher profile updated", { user, facultyProfile: profile });
});
