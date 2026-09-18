import mongoose from "mongoose";

import WatchLater from "../models/WatchLater.js";
import Video from "../models/Video.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Toggle Watch Later
export const toggleWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOne({
    _id: videoId,
    isPublished: true,
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingWatchLater = await WatchLater.findOne({
    user: req.user._id,
    video: videoId,
  });

  if (existingWatchLater) {
    await WatchLater.findByIdAndDelete(existingWatchLater._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSaved: false,
          videoId,
        },
        "Video removed from Watch Later",
      ),
    );
  }

  await WatchLater.create({
    user: req.user._id,
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isSaved: true,
        videoId,
      },
      "Video added to Watch Later",
    ),
  );
});

// Get Watch Later status for a video
export const getWatchLaterStatus = asyncHandler(
  async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const watchLater = await WatchLater.exists({
      user: req.user._id,
      video: videoId,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSaved: Boolean(watchLater),
          videoId,
        },
        "Watch Later status fetched successfully",
      ),
    );
  },
);

// Get current user's Watch Later videos
export const getMyWatchLater = asyncHandler(
  async (req, res) => {
    const watchLaterVideos = await WatchLater.find({
      user: req.user._id,
    })
      .sort({ savedAt: -1 })
      .populate({
        path: "video",
        select:
          "title description videoUrl thumbnailUrl duration views likes category tags createdAt channel",
        populate: {
          path: "channel",
          select:
            "channelName handle avatar subscribers isVerified description",
        },
      })
      .lean();

    const videos = watchLaterVideos
      .filter((item) => item.video)
      .map((item) => ({
        ...item.video,
        isSaved: true,
        savedAt: item.savedAt,
      }));

    return res.status(200).json(
      new ApiResponse(
        200,
        videos,
        "Watch Later videos fetched successfully",
      ),
    );
  },
);

// Remove a specific video from Watch Later
export const removeFromWatchLater = asyncHandler(
  async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const deleted = await WatchLater.findOneAndDelete({
      user: req.user._id,
      video: videoId,
    });

    if (!deleted) {
      throw new ApiError(
        404,
        "Video is not in Watch Later",
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videoId,
          isSaved: false,
        },
        "Video removed from Watch Later",
      ),
    );
  },
);