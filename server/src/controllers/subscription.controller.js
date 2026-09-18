import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Channel from "../models/Channel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotifications.js";

export const toggleSubscription = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;

  // Validate Channel ID
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return next(new ApiError(400, "Invalid channel ID"));
  }

  // Find channel
  const channel = await Channel.findById(channelId);

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  // Prevent subscribing to your own channel
  if (channel.owner.toString() === req.user._id.toString()) {
    return next(new ApiError(400, "You cannot subscribe to your own channel"));
  }

  // Check existing subscription
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe
    await existingSubscription.deleteOne();

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      {
        $inc: { subscribers: -1 },
      },
      { new: true },
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          subscribed: false,
          subscribers: updatedChannel.subscribers,
        },
        "Channel unsubscribed successfully",
      ),
    );
  }

  // Subscribe
  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  const updatedChannel = await Channel.findByIdAndUpdate(
    channelId,
    {
      $inc: { subscribers: 1 },
    },
    { new: true },
  );

  // Create notification for channel owner
  await createNotification({
    recipient: channel.owner,
    sender: req.user._id,
    type: "subscription",
    title: "New subscriber",
    message: `${req.user.name} subscribed to your channel.`,
    channel: channel._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribed: true,
        subscribers: updatedChannel.subscribers,
      },
      "Channel subscribed successfully",
    ),
  );
});

export const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({
    subscriber: req.user._id,
  })
    .populate({
      path: "channel",
      select:
        "channelName handle avatar banner subscribers isVerified description",
    })
    .sort({
      createdAt: -1,
    });

  // Remove subscriptions whose channel was deleted
  const channels = subscriptions
    .filter((subscription) => subscription.channel)
    .map((subscription) => subscription.channel);

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscriptions fetched successfully"));
});

export const getChannelSubscribers = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;

  // Validate channel ID
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return next(new ApiError(400, "Invalid channel ID"));
  }

  // Check channel exists
  const channel = await Channel.findById(channelId);

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  // Find subscribers
  const subscriptions = await Subscription.find({
    channel: channelId,
  })
    .populate({
      path: "subscriber",
      select: "name avatar",
    })
    .sort({
      createdAt: -1,
    });

  // Remove deleted users
  const subscribers = subscriptions
    .filter((subscription) => subscription.subscriber)
    .map((subscription) => subscription.subscriber);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully"),
    );
});

export const checkSubscriptionStatus = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;

  // Validate channel ID
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return next(new ApiError(400, "Invalid channel ID"));
  }

  // Check channel exists
  const channel = await Channel.findById(channelId);

  if (!channel) {
    return next(new ApiError(404, "Channel not found"));
  }

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribed: !!subscription,
      },
      "Subscription status fetched successfully",
    ),
  );
});
