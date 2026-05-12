import Timetable from "../models/Timetable.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { list, success } from "../utils/apiResponse.js";

export const getTimetableEntries = asyncHandler(async (req, res) => {
  const data = await Timetable.find(req.query).populate("teacherId", "name email department").sort("day startTime");
  return list(res, { data, total: data.length });
});

export const getTeacherTimetable = asyncHandler(async (req, res) => {
  const data = await Timetable.find({ teacherId: req.params.teacherId }).sort("day startTime");
  return success(res, data.length ? "Teacher timetable loaded" : "No timetable available", data);
});
