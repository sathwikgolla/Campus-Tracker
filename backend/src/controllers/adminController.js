import Department from "../models/Department.js";
import FacultyProfile from "../models/FacultyProfile.js";
import FacultyRequest from "../models/FacultyRequest.js";
import User from "../models/User.js";
import Timetable from "../models/Timetable.js";
import { getFacultyLiveStatus } from "../utils/liveStatus.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { list, success } from "../utils/apiResponse.js";

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalStudents, totalTeachers, faculty, timetable, totalDepartments, pendingRequests, recentUsers, recentRequests] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    User.countDocuments({ role: "teacher", isActive: true }),
    FacultyProfile.find({ isActive: true }),
    Timetable.find(),
    Department.countDocuments({ isActive: true }),
    FacultyRequest.countDocuments({ status: "Pending" }),
    User.find().select("-password").sort("-createdAt").limit(8),
    FacultyRequest.find().populate("student teacher", "name email role").sort("-createdAt").limit(8),
  ]);
  const live = faculty.map((profile) => getFacultyLiveStatus(profile, timetable.filter((entry) => String(entry.teacherId) === String(profile.user))));
  const availableFaculty = live.filter((item) => item.status === "Available").length;
  const inClassFaculty = live.filter((item) => item.status === "In Class").length;
  const departmentWiseFaculty = faculty.reduce((acc, profile) => ({ ...acc, [profile.department]: (acc[profile.department] || 0) + 1 }), {});
  return success(res, "Admin dashboard loaded", { totalStudents, totalTeachers, totalFaculty: faculty.length, availableFaculty, inClassFaculty, totalDepartments, pendingRequests, recentUsers, recentRequests, timetableEntries: timetable.length, departmentWiseFaculty });
});

export const getUsers = asyncHandler(async (req, res) => list(res, { data: await User.find().select("-password").sort("-createdAt"), total: await User.countDocuments() }));
export const getUser = asyncHandler(async (req, res) => success(res, "User loaded", await User.findById(req.params.id).select("-password")));
export const updateUser = asyncHandler(async (req, res) => success(res, "User updated", await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password")));
export const deleteUser = asyncHandler(async (req, res) => success(res, "User disabled", await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password")));

export const getAdminFaculty = asyncHandler(async (req, res) => list(res, { data: await FacultyProfile.find().sort("name"), total: await FacultyProfile.countDocuments() }));
export const createAdminFaculty = asyncHandler(async (req, res) => success(res, "Faculty profile created", await FacultyProfile.create(req.body), 201));
export const updateAdminFaculty = asyncHandler(async (req, res) => success(res, "Faculty profile updated", await FacultyProfile.findByIdAndUpdate(req.params.id, req.body, { new: true })));
export const deleteAdminFaculty = asyncHandler(async (req, res) => success(res, "Faculty profile disabled", await FacultyProfile.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })));

export const getAdminDepartments = asyncHandler(async (req, res) => list(res, { data: await Department.find().sort("code"), total: await Department.countDocuments() }));
export const createAdminDepartment = asyncHandler(async (req, res) => success(res, "Department created", await Department.create(req.body), 201));
export const updateAdminDepartment = asyncHandler(async (req, res) => success(res, "Department updated", await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })));
export const deleteAdminDepartment = asyncHandler(async (req, res) => success(res, "Department disabled", await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })));
