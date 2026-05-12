import Department from "../models/Department.js";
import FacultyProfile from "../models/FacultyProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { list, success } from "../utils/apiResponse.js";

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort("code");
  return list(res, { data: departments, total: departments.length });
});

export const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: "Department not found" });
  const facultyCount = await FacultyProfile.countDocuments({ department: department.code, isActive: true });
  return success(res, "Department loaded", { department, facultyCount });
});

export const createDepartment = asyncHandler(async (req, res) => success(res, "Department created", await Department.create(req.body), 201));
export const updateDepartment = asyncHandler(async (req, res) => success(res, "Department updated", await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })));
export const deleteDepartment = asyncHandler(async (req, res) => success(res, "Department disabled", await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })));
