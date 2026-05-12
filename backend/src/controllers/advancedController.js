import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";
import AttendanceRecord from "../models/AttendanceRecord.js";
import AttendanceSession from "../models/AttendanceSession.js";
import AvailabilityLog from "../models/AvailabilityLog.js";
import AvailabilitySlot from "../models/AvailabilitySlot.js";
import Broadcast from "../models/Broadcast.js";
import Event from "../models/Event.js";
import FacultyProfile from "../models/FacultyProfile.js";
import FacultyStatus from "../models/FacultyStatus.js";
import Favorite from "../models/Favorite.js";
import ForumPost from "../models/ForumPost.js";
import Notification from "../models/Notification.js";
import RecentSearch from "../models/RecentSearch.js";
import ThemePreference from "../models/ThemePreference.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import { emit } from "../config/socket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { list, success } from "../utils/apiResponse.js";

export const updateLiveStatus = asyncHandler(async (req, res) => {
  const faculty = req.user.role === "admin"
    ? await FacultyProfile.findById(req.body.facultyId)
    : await FacultyProfile.findOne({ user: req.user._id });
  if (!faculty) return res.status(404).json({ success: false, message: "Faculty profile not found" });

  const status = await FacultyStatus.findOneAndUpdate(
    { facultyId: faculty._id },
    { ...req.body, facultyId: faculty._id, lastUpdated: new Date(), updatedBy: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  faculty.status = req.body.status || faculty.status;
  faculty.cabin = req.body.cabin || faculty.cabin;
  faculty.location = req.body.location || faculty.location;
  faculty.availableTime = [req.body.availableFrom, req.body.availableTo].filter(Boolean).join(" - ") || faculty.availableTime;
  faculty.lastUpdated = new Date();
  await faculty.save();
  await AvailabilityLog.create({ facultyId: faculty._id, status: faculty.status, cabin: faculty.cabin });
  const favorites = await Favorite.find({ faculty: faculty._id }).select("student");
  if (favorites.length) {
    await Notification.insertMany(favorites.map((favorite) => ({
      user: favorite.student,
      title: "Faculty Status Updated",
      message: `${faculty.name} is now ${faculty.status} at ${faculty.cabin}`,
      type: "statusUpdate",
    })));
  }
  emit("facultyStatusUpdated", { facultyId: faculty._id, status: faculty.status, cabin: faculty.cabin, location: faculty.location, availableTime: faculty.availableTime });
  return success(res, "Live status updated", status);
});

export const getLiveStatuses = asyncHandler(async (req, res) => list(res, { data: await FacultyStatus.find().populate("facultyId"), total: await FacultyStatus.countDocuments() }));

export const smartFacultySearch = asyncHandler(async (req, res) => {
  const query = req.query.query || "";
  const regex = new RegExp(query.split(" ").filter(Boolean).join("|") || ".", "i");
  const data = await FacultyProfile.find({
    isActive: true,
    $or: [{ name: regex }, { department: regex }, { subjects: regex }, { cabin: regex }, { designation: regex }, { status: regex }, { location: regex }],
  }).limit(20);
  if (req.user.role === "student") {
    await RecentSearch.create({ student: req.user._id, keyword: query, filters: {}, matchedCount: data.length });
  }
  return list(res, { data, total: data.length, message: "Smart search completed" });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const tokenNumber = await Appointment.countDocuments({ facultyId: req.body.facultyId, status: "Pending" }) + 1;
  const appointment = await Appointment.create({ ...req.body, studentId: req.user._id, tokenNumber });
  const faculty = await FacultyProfile.findById(req.body.facultyId);
  if (faculty?.user) {
    await Notification.create({ user: faculty.user, title: "New Student Request", message: `${req.user.name} sent you a request for ${req.body.reason}`, type: "request" });
    emit("newNotification", { userId: faculty.user, title: "New Student Request", message: `${req.user.name} sent you a request for ${req.body.reason}`, type: "request" }, `user:${faculty.user}`);
  }
  return success(res, `Appointment requested. You are Token #${tokenNumber} in queue`, appointment, 201);
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const filter = req.user.role === "teacher" ? {} : { studentId: req.user._id };
  if (req.user.role === "teacher") {
    const profile = await FacultyProfile.findOne({ user: req.user._id });
    filter.facultyId = profile?._id;
  }
  const data = await Appointment.find(filter).populate("facultyId studentId slotId").sort("-createdAt");
  return list(res, { data, total: data.length });
});

async function updateAppointment(req, res, status) {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status, teacherResponse: req.body.teacherResponse }, { new: true }).populate("studentId facultyId");
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
  await Notification.create({ user: appointment.studentId._id, title: status === "Accepted" ? "Request Accepted" : status === "Rejected" ? "Request Rejected" : `Appointment ${status}`, message: `${req.user.name} ${status.toLowerCase()} your request`, type: status === "Accepted" ? "requestAccepted" : status === "Rejected" ? "requestRejected" : "request" });
  emit("requestStatusUpdated", appointment, `user:${appointment.studentId._id}`);
  return success(res, `Appointment ${status.toLowerCase()}`, appointment);
}
export const acceptAppointment = asyncHandler((req, res) => updateAppointment(req, res, "Accepted"));
export const rejectAppointment = asyncHandler((req, res) => updateAppointment(req, res, "Rejected"));
export const completeAppointment = asyncHandler((req, res) => updateAppointment(req, res, "Completed"));
export const cancelAppointment = asyncHandler((req, res) => updateAppointment(req, res, "Cancelled"));

export const analytics = asyncHandler(async (req, res) => {
  const [totalStudents, totalTeachers, totalDepartments, totalFaculty, statusDistribution, searches] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "teacher", isActive: true }),
    FacultyProfile.distinct("department", { isActive: true }),
    FacultyProfile.countDocuments({ isActive: true }),
    FacultyProfile.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    RecentSearch.aggregate([{ $group: { _id: "$keyword", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
  ]);
  return success(res, "Analytics loaded", { totalStudents, totalTeachers, totalDepartments: totalDepartments.length, totalFaculty, statusDistribution, searches });
});

export const chat = asyncHandler(async (req, res) => {
  const message = (req.body.message || "").toLowerCase();
  const faculty = await FacultyProfile.findOne({
    isActive: true,
    $or: [{ name: new RegExp(message, "i") }, { subjects: new RegExp(message, "i") }, { department: new RegExp(message, "i") }],
  });
  const reply = faculty
    ? `${faculty.name} is ${faculty.status} in ${faculty.cabin || faculty.location}. Available time: ${faculty.availableTime || "Not updated"}.`
    : "I can help you find faculty, book appointments, understand departments, events, and campus map guidance.";
  return success(res, "CampusBot reply", { reply });
});

export const createBroadcast = asyncHandler(async (req, res) => {
  const broadcast = await Broadcast.create({ ...req.body, createdBy: req.user._id });
  const query = req.body.targetRole && req.body.targetRole !== "all" ? { role: req.body.targetRole.replace("students", "student").replace("teachers", "teacher") } : {};
  const users = await User.find(query).select("_id");
  await Notification.insertMany(users.map((user) => ({ user: user._id, title: broadcast.title, message: broadcast.message, type: "broadcast" })));
  emit("emergencyBroadcast", { title: broadcast.title, message: broadcast.message, priority: broadcast.priority });
  return success(res, "Broadcast sent", broadcast, 201);
});
export const getBroadcasts = asyncHandler(async (req, res) => list(res, { data: await Broadcast.find().sort("-createdAt"), total: await Broadcast.countDocuments() }));

export const getTimetable = asyncHandler(async (req, res) => list(res, { data: await Timetable.find(req.query).populate("teacher faculty").sort("day startTime"), total: await Timetable.countDocuments(req.query) }));
export const createTimetable = asyncHandler(async (req, res) => success(res, "Timetable entry created", await Timetable.create({ ...req.body, createdBy: req.user._id }), 201));
export const updateTimetable = asyncHandler(async (req, res) => success(res, "Timetable updated", await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true })));
export const deleteTimetable = asyncHandler(async (req, res) => success(res, "Timetable deleted", await Timetable.findByIdAndDelete(req.params.id)));

export const createAttendanceSession = asyncHandler(async (req, res) => success(res, "Attendance session created", await AttendanceSession.create({ ...req.body, teacherId: req.user._id }), 201));
export const submitAttendance = asyncHandler(async (req, res) => {
  const records = await AttendanceRecord.insertMany(req.body.records.map((record) => ({ ...record, sessionId: req.params.sessionId })), { ordered: false });
  return success(res, "Attendance submitted", records);
});
export const getAttendance = asyncHandler(async (req, res) => list(res, { data: await AttendanceRecord.find(req.query).populate("sessionId studentId"), total: await AttendanceRecord.countDocuments(req.query) }));

export const getTheme = asyncHandler(async (req, res) => success(res, "Theme loaded", await ThemePreference.findOne({ user: req.user._id })));
export const updateTheme = asyncHandler(async (req, res) => success(res, "Theme updated", await ThemePreference.findOneAndUpdate({ user: req.user._id }, { theme: req.body.theme }, { new: true, upsert: true })));

export const getPrediction = asyncHandler(async (req, res) => {
  const logs = await AvailabilityLog.aggregate([
    { $match: { facultyId: new mongoose.Types.ObjectId(req.params.id), status: "Available" } },
    { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  const hour = logs[0]?._id || 14;
  return success(res, "Prediction loaded", { prediction: `Usually available around ${hour}:00 - ${hour + 2}:00`, confidence: logs[0] ? "High" : "Medium" });
});

export const getEvents = asyncHandler(async (req, res) => list(res, { data: await Event.find(req.query).populate("createdBy", "name role").sort("date"), total: await Event.countDocuments(req.query) }));
export const createEvent = asyncHandler(async (req, res) => success(res, "Event created", await Event.create({ ...req.body, createdBy: req.user._id }), 201));
export const toggleInterested = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  const exists = event.interestedUsers.some((id) => String(id) === String(req.user._id));
  event.interestedUsers = exists ? event.interestedUsers.filter((id) => String(id) !== String(req.user._id)) : [...event.interestedUsers, req.user._id];
  await event.save();
  return success(res, "Interest updated", event);
});

export const getForumPosts = asyncHandler(async (req, res) => list(res, { data: await ForumPost.find({ isActive: true }).populate("author comments.author", "name role").sort("-isPinned -createdAt"), total: await ForumPost.countDocuments({ isActive: true }) }));
export const createForumPost = asyncHandler(async (req, res) => success(res, "Post created", await ForumPost.create({ ...req.body, author: req.user._id }), 201));
export const likeForumPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  const exists = post.likes.some((id) => String(id) === String(req.user._id));
  post.likes = exists ? post.likes.filter((id) => String(id) !== String(req.user._id)) : [...post.likes, req.user._id];
  await post.save();
  return success(res, "Like updated", post);
});
export const commentForumPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  post.comments.push({ author: req.user._id, content: req.body.content, isOfficialAnswer: req.user.role === "teacher" && Boolean(req.body.isOfficialAnswer) });
  await post.save();
  return success(res, "Comment added", post);
});
export const moderateForumPost = asyncHandler(async (req, res) => success(res, "Post moderated", await ForumPost.findByIdAndUpdate(req.params.id, req.body, { new: true })));
