import mongoose from "mongoose";

import History from "../models/History.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

// =====================================================
// Add / Update Watch History
// =====================================================

export const addToHistory = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const user = await User.findById(req.user._id).select(
    "historyPaused",
  );

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // -----------------------------------------
  // History is paused
  // -----------------------------------------

  // STOP HERE when paused

  if (user.historyPaused === true) {
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Watch history is paused",
      ),
    );
  }

  // -----------------------------------------
  // Verify video
  // -----------------------------------------

  const video = await Video.findById(videoId);

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  // -----------------------------------------
  // Add / update history
  // -----------------------------------------

  const history = await History.findOneAndUpdate(
    {
      user: req.user._id,
      video: videoId,
    },
    {
      $set: {
        watchedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Video added to watch history"));
});

// =====================================================
// Update Watch Progress
// =====================================================

export const updateHistoryProgress = asyncHandler(
  async (req, res, next) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return next(new ApiError(400, "Invalid video ID"));
    }

    // -----------------------------------------
    // Check if history is paused
    // -----------------------------------------

    const user = await User.findById(req.user._id).select(
      "historyPaused",
    );

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    if (user.historyPaused === true) {
      return res.status(200).json(
        new ApiResponse(
          200,
          null,
          "Watch history is paused",
        ),
      );
    }

    // -----------------------------------------
    // Verify video
    // -----------------------------------------

    const video = await Video.findById(videoId);

    if (!video) {
      return next(new ApiError(404, "Video not found"));
    }

    // -----------------------------------------
    // Validate progress
    // -----------------------------------------

    let progress = Number(req.body.progress);
    let progressPercent = Number(req.body.progressPercent);

    if (!Number.isFinite(progress)) {
      progress = 0;
    }

    if (!Number.isFinite(progressPercent)) {
      progressPercent = 0;
    }

    progress = Math.max(
      0,
      Math.min(
        progress,
        video.duration || progress,
      ),
    );

    progressPercent = Math.max(
      0,
      Math.min(progressPercent, 100),
    );

    // -----------------------------------------
    // Update history
    // -----------------------------------------

    const history = await History.findOneAndUpdate(
      {
        user: req.user._id,
        video: videoId,
      },
      {
        $set: {
          progress,
          progressPercent,
          watchedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        history,
        "Watch progress updated",
      ),
    );
  },
);

// =====================================================
// Get Watch History
// =====================================================

export const getHistory = asyncHandler(async (req, res) => {
  const history = await History.find({
    user: req.user._id,
  })
    .populate({
      path: "video",
      populate: {
        path: "channel",
        select: "channelName handle avatar isVerified subscribers",
      },
    })
    .sort({
      watchedAt: -1,
    })
    .lean();

  // Remove history entries whose video
  // no longer exists
  const validHistory = history.filter((item) => item.video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, validHistory, "Watch history fetched successfully"),
    );
});

// =====================================================
// Remove One History Item
// =====================================================

export const removeFromHistory = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const deleted = await History.findOneAndDelete({
    user: req.user._id,
    video: videoId,
  });

  if (!deleted) {
    return next(new ApiError(404, "Video not found in watch history"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Removed from watch history"));
});

// =====================================================
// Clear Entire History
// =====================================================

export const clearHistory = asyncHandler(async (req, res) => {
  await History.deleteMany({
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Watch history cleared successfully"));
});

// =====================================================
// Get History Settings
// =====================================================

export const getHistorySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("historyPaused");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      paused: user.historyPaused,
    },
  });
});

// =====================================================
// Pause / Resume History
// =====================================================

export const setHistoryPaused = asyncHandler(async (req, res) => {
  const { paused } = req.body;

  if (typeof paused !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "paused must be a boolean",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        historyPaused: paused,
      },
    },
    {
      new: true,
    },
  ).select("historyPaused");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      paused: user.historyPaused,
    },
    message: paused ? "Watch history paused" : "Watch history resumed",
  });
});
