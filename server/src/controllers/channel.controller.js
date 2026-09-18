import Channel from "../models/Channel.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import Subscription from "../models/Subscription.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import createNotification from "../utils/createNotifications.js";

export const createChannel = asyncHandler(async (req, res, next) => {
  const {
    channelName,
    handle,
    description,
    website,
    github,
    linkedin,
    instagram,
    twitter,
  } = req.body;
  const avatar = req.files?.avatar?.[0];
  const banner = req.files?.banner?.[0];

  // Validation
  if (!channelName?.trim() || !handle?.trim()) {
    return next(new ApiError(400, "Channel name and handle are required"));
  }

  if (!avatar) {
    return next(new ApiError(400, "Avatar is required"));
  }

  const normalizedHandle = handle.trim().toLowerCase();

  // Check if user already has a channel
  const existingChannel = await Channel.findOne({
    owner: req.user._id,
  });

  if (existingChannel) {
    return next(new ApiError(409, "You already have a channel"));
  }

  // Check handle uniqueness
  const handleExists = await Channel.findOne({
    handle: normalizedHandle,
  });

  if (handleExists) {
    return next(new ApiError(409, "Handle already taken"));
  }

  // Create channel
  const channel = await Channel.create({
    owner: req.user._id,
    channelName: channelName.trim(),
    handle: normalizedHandle,
    description: description?.trim() || "",

    avatar: avatar.path,
    avatarPublicId: avatar.filename,

    banner: banner?.path || "",
    bannerPublicId: banner?.filename || "",

    website: website?.trim() || "",
    github: github?.trim() || "",
    linkedin: linkedin?.trim() || "",
    instagram: instagram?.trim() || "",
    twitter: twitter?.trim() || "",
  });

  // Update user
  await User.findByIdAndUpdate(req.user._id, {
    hasChannel: true,
  });

  await createNotification({
    recipient: req.user._id,
    sender: req.user._id,
    type: "channel",
    title: "Channel created",
    message: `Your channel "${channel.channelName}" was created successfully.`,
    channel: channel._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, channel, "Channel created successfully"));
});

export const getMyChannel = asyncHandler(async (req, res, next) => {
  const channel = await Channel.findOne({
    owner: req.user._id,
  }).lean();

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  const stats = await Video.aggregate([
    {
      $match: {
        channel: channel._id,
        isPublished: true,
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: {
          $sum: 1,
        },
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  const totalVideos = stats[0]?.totalVideos || 0;
  const totalViews = stats[0]?.totalViews || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...channel,
        totalVideos,
        totalViews,
      },
      "Channel fetched successfully",
    ),
  );
});

export const updateChannel = asyncHandler(async (req, res, next) => {
  const {
    channelName,
    handle,
    description,
    website,
    github,
    linkedin,
    instagram,
    twitter,
  } = req.body;

  const avatar = req.files?.avatar?.[0];
  const banner = req.files?.banner?.[0];

  // Find user's channel
  const channel = await Channel.findOne({
    owner: req.user._id,
  });

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  // Track actual changes
  const changes = [];

  // =========================
  // Channel Name
  // =========================
  if (channelName !== undefined) {
    const trimmedName = channelName.trim();

    if (!trimmedName) {
      return next(new ApiError(400, "Channel name cannot be empty"));
    }

    if (trimmedName !== channel.channelName) {
      channel.channelName = trimmedName;
      changes.push("channel name");
    }
  }

  // =========================
  // Handle
  // =========================
  if (handle !== undefined) {
    const normalizedHandle = handle.trim().toLowerCase();

    if (!normalizedHandle) {
      return next(new ApiError(400, "Handle cannot be empty"));
    }

    if (normalizedHandle !== channel.handle) {
      // Check if handle already exists
      const existingHandle = await Channel.findOne({
        handle: normalizedHandle,
        _id: { $ne: channel._id },
      });

      if (existingHandle) {
        return next(new ApiError(409, "Handle already taken"));
      }

      channel.handle = normalizedHandle;
      changes.push("handle");
    }
  }

  // =========================
  // Description
  // =========================
  if (description !== undefined) {
    const trimmedDescription = description.trim();

    if (trimmedDescription !== channel.description) {
      channel.description = trimmedDescription;
      changes.push("description");
    }
  }

  // =========================
  // Avatar
  // =========================
  if (avatar) {
    if (channel.avatarPublicId) {
      await deleteFromCloudinary(channel.avatarPublicId);
    }

    channel.avatar = avatar.path;
    channel.avatarPublicId = avatar.filename;

    changes.push("avatar");
  }

  // =========================
  // Banner
  // =========================
  if (banner) {
    if (channel.bannerPublicId) {
      await deleteFromCloudinary(channel.bannerPublicId);
    }

    channel.banner = banner.path;
    channel.bannerPublicId = banner.filename;

    changes.push("banner");
  }

  // =========================
  // Website
  // =========================
  if (website !== undefined) {
    const value = website.trim();

    if (value !== channel.website) {
      channel.website = value;
      changes.push("website");
    }
  }

  // =========================
  // GitHub
  // =========================
  if (github !== undefined) {
    const value = github.trim();

    if (value !== channel.github) {
      channel.github = value;
      changes.push("GitHub");
    }
  }

  // =========================
  // LinkedIn
  // =========================
  if (linkedin !== undefined) {
    const value = linkedin.trim();

    if (value !== channel.linkedin) {
      channel.linkedin = value;
      changes.push("LinkedIn");
    }
  }

  // =========================
  // Instagram
  // =========================
  if (instagram !== undefined) {
    const value = instagram.trim();

    if (value !== channel.instagram) {
      channel.instagram = value;
      changes.push("Instagram");
    }
  }

  // =========================
  // Twitter
  // =========================
  if (twitter !== undefined) {
    const value = twitter.trim();

    if (value !== channel.twitter) {
      channel.twitter = value;
      changes.push("Twitter");
    }
  }

  // =========================
  // Save
  // =========================
  await channel.save();

  // =========================
  // Notification
  // =========================
  if (changes.length > 0) {
    await createNotification({
      recipient: req.user._id,
      sender: req.user._id,
      type: "channel",
      title: "Channel updated",
      message: `Your channel "${channel.channelName}" was updated successfully.`,
      channel: channel._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel updated successfully"));
});

export const getChannelByHandle = asyncHandler(async (req, res, next) => {
  const { handle } = req.params;
  const channel = await Channel.findOne({
    handle: handle.trim().toLowerCase(),
  })
    .populate("owner", "name email avatar")
    .select("-updatedAt")
    .lean();

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  let isOwner = false;
  let isSubscribed = false;

  if (req.user) {
    isOwner = channel.owner._id.toString() === req.user._id.toString();

    if (!isOwner) {
      const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channel._id,
      });

      isSubscribed = !!subscription;
    }
  }

  const stats = await Video.aggregate([
    {
      $match: {
        channel: channel._id,
        isPublished: true,
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalVideos = stats[0]?.totalVideos || 0;
  const totalViews = stats[0]?.totalViews || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...channel,
        totalVideos,
        totalViews,
        isOwner,
        isSubscribed,
      },
      "Channel fetched successfully",
    ),
  );
});
