import FacultyProfile from "../models/FacultyProfile.js";
import FacultyRequest from "../models/FacultyRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";

export const createRequest = asyncHandler(async (req, res) => {
  const { teacherId, facultyProfileId, reason, message, requestedTime } = req.body;
  const request = await FacultyRequest.create({
    student: req.user._id,
    teacher: teacherId,
    facultyProfile: facultyProfileId,
    reason,
    message,
    requestedTime,
  });
  const student = await User.findById(req.user._id);
  await Notification.create({ user: teacherId, title: "New Student Request", message: `${student.name} sent you a request for ${reason}`, type: "request", link: `/requests/${request._id}` });
  return success(res, "Request sent", request, 201);
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await FacultyRequest.find({ student: req.user._id }).populate("teacher", "name email").populate("facultyProfile").sort("-createdAt");
  return success(res, "Requests loaded", requests);
});

export const getTeacherRequests = asyncHandler(async (req, res) => {
  const requests = await FacultyRequest.find({ teacher: req.user._id }).populate("student", "name email rollNumber branch").populate("facultyProfile").sort("-createdAt");
  return success(res, "Teacher requests loaded", requests);
});

async function updateRequestStatus(req, res, status) {
  const request = await FacultyRequest.findOne({ _id: req.params.id, teacher: req.user._id });
  if (!request) return res.status(404).json({ success: false, message: "Request not found" });
  request.status = status;
  request.teacherResponse = req.body.teacherResponse;
  request.respondedAt = new Date();
  await request.save();
  await Notification.create({
    user: request.student,
    title: status === "Accepted" ? "Request Accepted" : status === "Rejected" ? "Request Rejected" : `Request ${status}`,
    message: `${req.user.name} ${status.toLowerCase()} your request`,
    type: status === "Accepted" ? "requestAccepted" : status === "Rejected" ? "requestRejected" : "request",
    link: `/requests/${request._id}`,
  });
  return success(res, `Request ${status.toLowerCase()}`, request);
}

export const acceptRequest = asyncHandler((req, res) => updateRequestStatus(req, res, "Accepted"));
export const rejectRequest = asyncHandler((req, res) => updateRequestStatus(req, res, "Rejected"));
export const completeRequest = asyncHandler((req, res) => updateRequestStatus(req, res, "Completed"));
