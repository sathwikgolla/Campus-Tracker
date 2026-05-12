import FacultyProfile from "../models/FacultyProfile.js";
import RecentSearch from "../models/RecentSearch.js";
import Timetable from "../models/Timetable.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { list, success } from "../utils/apiResponse.js";
import { getFacultyLiveStatus } from "../utils/liveStatus.js";

function buildFacultyQuery(query) {
  const filter = { isActive: true };
  if (query.department) filter.department = query.department;
  if (query.location) filter.location = new RegExp(query.location, "i");
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [
      { name: regex },
      { department: regex },
      { cabin: regex },
      { location: regex },
      { subjects: regex },
      { email: regex },
    ];
  }
  return filter;
}

export const getFaculty = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;
  const filter = buildFacultyQuery(req.query);
  const sort = req.query.sort || "name";
  const rawData = await FacultyProfile.find(filter).sort(sort);
  const timetableEntries = await Timetable.find({ teacherId: { $in: rawData.map((item) => item.user).filter(Boolean) } });
  const byTeacher = timetableEntries.reduce((acc, entry) => {
    const key = String(entry.teacherId);
    acc[key] = acc[key] || [];
    acc[key].push(entry);
    return acc;
  }, {});
  let liveData = rawData.map((faculty) => {
    const liveStatus = getFacultyLiveStatus(faculty, byTeacher[String(faculty.user)] || []);
    return { ...faculty.toObject(), liveStatus, status: liveStatus.status, location: liveStatus.location, availableTime: liveStatus.availableTime };
  });
  if (req.query.status) liveData = liveData.filter((faculty) => faculty.status === req.query.status);
  const total = liveData.length;
  const pageData = liveData.slice(skip, skip + limit);

  if (req.user.role === "student" && (req.query.search || req.query.department || req.query.status || req.query.location)) {
    await RecentSearch.create({
      student: req.user._id,
      keyword: req.query.search || "",
      filters: {
        department: req.query.department,
        status: req.query.status,
        location: req.query.location,
      },
      matchedCount: pageData.length,
    });
    if (pageData.length) {
      await FacultyProfile.updateMany({ _id: { $in: pageData.map((item) => item._id) } }, { $inc: { studentSearchCount: 1 } });
    }
  }

  return list(res, { data: pageData, total, page, limit });
});

export const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await FacultyProfile.findOneAndUpdate(
    { _id: req.params.id, isActive: true },
    { $inc: { profileViews: 1 } },
    { new: true }
  );
  if (!faculty) return res.status(404).json({ success: false, message: "Faculty profile not found" });
  const timetable = await Timetable.find({ teacherId: faculty.user }).sort("day startTime");
  const liveStatus = getFacultyLiveStatus(faculty, timetable);
  return success(res, "Faculty loaded", { ...faculty.toObject(), timetable, liveStatus, status: liveStatus.status, location: liveStatus.location, availableTime: liveStatus.availableTime });
});

export const createFaculty = asyncHandler(async (req, res) => {
  const faculty = await FacultyProfile.create(req.body);
  return success(res, "Faculty profile created", faculty, 201);
});

export const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await FacultyProfile.findById(req.params.id);
  if (!faculty) return res.status(404).json({ success: false, message: "Faculty profile not found" });
  if (req.user.role !== "admin" && String(faculty.user) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "You are not allowed to access this route" });
  }
  Object.assign(faculty, req.body, { lastUpdated: new Date() });
  await faculty.save();
  return success(res, "Faculty profile updated", faculty);
});

export const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await FacultyProfile.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!faculty) return res.status(404).json({ success: false, message: "Faculty profile not found" });
  return success(res, "Faculty profile deleted", faculty);
});
