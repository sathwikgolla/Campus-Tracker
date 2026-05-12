import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { list, success } from "../utils/apiResponse.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select("-password").sort("-createdAt");
  return list(res, { data: users, total: users.length });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return success(res, "User loaded", user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select("-password");
  return success(res, "User updated", user);
});
