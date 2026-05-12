import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";

export const getNotifications = asyncHandler(async (req, res) => success(res, "Notifications loaded", await Notification.find({ user: req.user._id }).sort("-createdAt")));

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  return success(res, "Notification marked read", notification);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { isRead: true });
  return success(res, "All notifications marked read");
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  return success(res, "Notification deleted");
});
