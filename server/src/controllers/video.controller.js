import mongoose from "mongoose";
import Video from "../models/Video.js";
import Like from "../models/Like.js";
import Channel from "../models/Channel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import Subscription from "../models/Subscription.js";
import createNotification from "../utils/createNotifications.js";

const PAID_MEMBERSHIP_PLANS = ["bronze", "silver", "gold"];

const hasPremiumAccess = (user) => {
  if (!user?.membership) {
    return false;
  }

  const { plan, status, endDate } = user.membership;

  if (!PAID_MEMBERSHIP_PLANS.includes(plan)) {
    return false;
  }

  if (status !== "active") {
    return false;
  }

  if (endDate && new Date(endDate) <= new Date()) {
    return false;
  }

  return true;
};

export const uploadVideo = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    category,
    duration,
    visibility,
    tags,
    isPremium,
  } = req.body;

  const allowedVisibility = ["public", "private", "unlisted"];

  if (visibility && !allowedVisibility.includes(visibility)) {
    return next(new ApiError(400, "Invalid visibility"));
  }

  const parsedTags = tags
    ? Array.isArray(tags)
      ? tags
      : JSON.parse(tags)
    : [];

  const cleanedTags = parsedTags
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  if (!title?.trim()) {
    return next(new ApiError(400, "Title is required"));
  }

  if (!req.files?.video || !req.files?.thumbnail) {
    return next(new ApiError(400, "Video and thumbnail are required"));
  }

  const channel = await Channel.findOne({
    owner: req.user._id,
  });

  if (!channel) {
    return next(new ApiError(404, "Create a channel before uploading videos"));
  }

  const videoUrl = req.files.video[0].path;
  const thumbnailUrl = req.files.thumbnail[0].path;

  const videoPublicId = req.files.video[0].filename;
  const thumbnailPublicId = req.files.thumbnail[0].filename;

  const video = await Video.create({
    channel: channel._id,
    title: title.trim(),
    description: description?.trim() || "",
    category: category?.trim() || "Other",
    duration: Number(duration) || 0,
    visibility: visibility || "public",
    tags: cleanedTags,

    // Premium videos can be marked during upload.
    isPremium: isPremium === true || isPremium === "true",

    videoUrl,
    thumbnailUrl,

    videoPublicId,
    thumbnailPublicId,
  });

  const createdVideo = await Video.findById(video._id)
    .populate({
      path: "channel",
      select: "channelName handle avatar subscribers isVerified",
    })
    .lean();

  if (
    createdVideo &&
    createdVideo.visibility === "public" &&
    createdVideo.isPublished
  ) {
    const subscriptions = await Subscription.find({
      channel: channel._id,
    }).select("subscriber");

    await Promise.all(
      subscriptions.map((subscription) =>
        createNotification({
          recipient: subscription.subscriber,
          sender: req.user._id,
          type: "new_video",
          title: `New video from ${channel.channelName}`,
          message: createdVideo.title,
          video: createdVideo._id,
          channel: channel._id,
        }),
      ),
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"));
});

export const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({
    isPublished: true,
    visibility: "public",
  })
    .populate({
      path: "channel",
      select: "channelName handle avatar subscribers isVerified",
    })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export const getVideoById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const video = await Video.findById(id).populate({
    path: "channel",
    select:
      "_id channelName handle avatar subscribers isVerified description owner",
  });

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  if (video.visibility === "private") {
    return next(new ApiError(403, "This video is private"));
  }

  // Premium videos require an active paid membership.
  // The free-plan quota will be enforced when watch-time/usage
  // tracking is added in the next restriction step.
  const premiumAccess = !video.isPremium || hasPremiumAccess(req.user);

  if (premiumAccess) {
    video.views += 1;
    await video.save();
  }

  let isSubscribed = false;

  if (req.user) {
    const subscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: video.channel._id,
    });

    isSubscribed = !!subscription;
  }

  let isLiked = false;

  if (req.user) {
    const like = await Like.findOne({
      user: req.user._id,
      video: video._id,
    });

    isLiked = !!like;
  }

  const responseVideo = video.toObject();

  responseVideo.premiumAccess = premiumAccess;

  if (video.isPremium && !premiumAccess) {
    responseVideo.videoUrl = null;
    responseVideo.videoPublicId = null;
  }
  
  responseVideo.isLiked = isLiked;

  responseVideo.channel.isSubscribed = isSubscribed;


  responseVideo.channel.isOwner =
    !!req.user && video.channel.owner.toString() === req.user._id.toString();

  return res
    .status(200)
    .json(new ApiResponse(200, responseVideo, "Video fetched successfully"));
});

export const getVideoForEdit = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const video = await Video.findById(id).populate({
    path: "channel",
    select: "channelName handle avatar subscribers isVerified",
  });

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  const channel = await Channel.findOne({
    owner: req.user._id,
  });

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  if (video.channel._id.toString() !== channel._id.toString()) {
    return next(new ApiError(403, "You are not authorized to edit this video"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

export const updateVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const video = await Video.findById(id);

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  const channel = await Channel.findOne({
    owner: req.user._id,
  });

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  if (video.channel.toString() !== channel._id.toString()) {
    return next(
      new ApiError(403, "You are not authorized to update this video"),
    );
  }

  const {
    title,
    description,
    category,
    visibility,
    tags,
    isPublished,
    isPremium,
  } = req.body;

  const allowedVisibility = ["public", "private", "unlisted"];

  if (visibility && !allowedVisibility.includes(visibility)) {
    return next(new ApiError(400, "Invalid visibility"));
  }

  const thumbnail = req.files?.thumbnail?.[0];

  if (title !== undefined) {
    video.title = title.trim();
  }

  if (description !== undefined) {
    video.description = description.trim();
  }

  if (category !== undefined) {
    video.category = category.trim();
  }

  if (thumbnail) {
    await deleteFromCloudinary(video.thumbnailPublicId);
    video.thumbnailUrl = thumbnail.path;
    video.thumbnailPublicId = thumbnail.filename;
  }

  if (visibility !== undefined) {
    video.visibility = visibility;
  }

  if (tags !== undefined) {
    const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);

    video.tags = parsedTags.map((tag) => tag.trim()).filter(Boolean);
  }

  if (isPublished !== undefined) {
    video.isPublished = isPublished;
  }

  if (isPremium !== undefined) {
    video.isPremium = isPremium === true || isPremium === "true";
  }

  await video.save();

  const updatedVideo = await Video.findById(video._id).populate({
    path: "channel",
    select: "channelName handle avatar subscribers isVerified",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

export const deleteVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const video = await Video.findById(id);

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  const channel = await Channel.findOne({
    owner: req.user._id,
  });

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  if (video.channel.toString() !== channel._id.toString()) {
    return next(
      new ApiError(403, "You are not authorized to delete this video"),
    );
  }

  if (video.videoPublicId) {
    await deleteFromCloudinary(video.videoPublicId, "video");
  }

  if (video.thumbnailPublicId) {
    await deleteFromCloudinary(video.thumbnailPublicId);
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

export const searchVideos = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No search query provided"));
  }

  const videos = await Video.find({
    isPublished: true,
    visibility: "public",
    $or: [
      {
        title: {
          $regex: q,
          $options: "i",
        },
      },
      {
        description: {
          $regex: q,
          $options: "i",
        },
      },
      {
        category: {
          $regex: q,
          $options: "i",
        },
      },
      {
        tags: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  })
    .populate({
      path: "channel",
      select: "channelName handle avatar isVerified subscribers",
    })
    .sort({
      createdAt: -1,
    })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export const getVideosByChannel = asyncHandler(async (req, res, next) => {
  const { handle } = req.params;

  const channel = await Channel.findOne({
    handle: handle.trim().toLowerCase(),
  });

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  const videos = await Video.find({
    channel: channel._id,
    isPublished: true,
    visibility: "public",
  })
    .sort({
      createdAt: -1,
    })
    .populate({
      path: "channel",
      select: "channelName handle avatar subscribers isVerified",
    })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export const getMyVideos = asyncHandler(async (req, res, next) => {
  const channel = await Channel.findOne({
    owner: req.user._id,
  });

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  const videos = await Video.find({
    channel: channel._id,
  })
    .populate({
      path: "channel",
      select: "channelName handle avatar subscribers isVerified",
    })
    .sort({
      createdAt: -1,
    })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});
