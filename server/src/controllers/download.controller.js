import mongoose from "mongoose";
import Video from "../models/Video.js";
import Download from "../models/Download.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

const FREE_DOWNLOAD_LIMIT = 1;

const DOWNLOAD_LIMITS = {
  free: FREE_DOWNLOAD_LIMIT,
  bronze: 5,
  silver: Infinity,
  gold: Infinity,
};

const getActiveMembershipPlan = (user) => {
  if (!user?.membership) {
    return "free";
  }

  const { plan, status, endDate } = user.membership;

  if (plan === "free") {
    return "free";
  }

  if (status !== "active") {
    return "free";
  }

  if (endDate && new Date(endDate) <= new Date()) {
    return "free";
  }

  return plan;
};

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getDownloadLimit = (plan) => {
  return DOWNLOAD_LIMITS[plan] ?? FREE_DOWNLOAD_LIMIT;
};

export const downloadVideo = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(
        new ApiError(400, "Invalid video ID"),
      );
    }

    if (!req.user?._id) {
      return next(
        new ApiError(
          401,
          "Authentication required",
        ),
      );
    }

    const video = await Video.findById(id).select(
      "title videoPublicId videoUrl visibility isPublished thumbnail thumbnailUrl",
    );

    if (!video) {
      return next(
        new ApiError(404, "Video not found"),
      );
    }

    if (!video.isPublished) {
      return next(
        new ApiError(404, "Video not found"),
      );
    }

    if (video.visibility !== "public") {
      return next(
        new ApiError(
          403,
          "This video is not available for download",
        ),
      );
    }

    if (!video.videoPublicId) {
      return next(
        new ApiError(
          404,
          "Video file not found",
        ),
      );
    }

    const plan = getActiveMembershipPlan(
      req.user,
    );

    const downloadLimit =
      getDownloadLimit(plan);

    if (downloadLimit === 0) {
      return next(
        new ApiError(
          403,
          "Video downloads are not available with your current membership plan",
        ),
      );
    }

    const startOfToday =
      getStartOfToday();

    const downloadsToday =
      await Download.countDocuments({
        user: req.user._id,
        downloadedAt: {
          $gte: startOfToday,
        },
      });

    if (
      downloadLimit !== Infinity &&
      downloadsToday >= downloadLimit
    ) {
      return next(
        new ApiError(
          403,
          plan === "free"
            ? "Free members can download only 1 video per day"
            : `Your ${plan} membership download limit has been reached`,
        ),
      );
    }

    const downloadUrl =
      cloudinary.url(
        video.videoPublicId,
        {
          resource_type: "video",
          type: "upload",
          secure: true,
          flags: "attachment",
        },
      );

    await Download.create({
      user: req.user._id,
      video: video._id,
      plan,
      videoTitle:
        video.title || "Binge Video",
      videoPublicId:
        video.videoPublicId,
      videoUrl:
        video.videoUrl || "",
      thumbnail:
        video.thumbnail ||
        video.thumbnailUrl ||
        "",
      downloadedAt: new Date(),
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          downloadUrl,
          fileName: `${
            video.title || "binge-video"
          }.mp4`,
          plan,
          downloadsToday:
            downloadsToday + 1,
          downloadLimit:
            downloadLimit === Infinity
              ? null
              : downloadLimit,
          remainingDownloads:
            downloadLimit === Infinity
              ? null
              : downloadLimit -
                (downloadsToday + 1),
          expiresAt: null,
        },
        "Download URL generated successfully",
      ),
    );
  },
);