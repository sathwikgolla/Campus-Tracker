import RecentSearch from "../models/RecentSearch.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/apiResponse.js";

export const getSearchHistory = asyncHandler(async (req, res) => {
  const data = await RecentSearch.find({ student: req.user._id }).sort("-searchedAt").limit(30);
  return success(res, "Search history loaded", data);
});

export const clearSearchHistory = asyncHandler(async (req, res) => {
  await RecentSearch.deleteMany({ student: req.user._id });
  return success(res, "Search history cleared");
});
