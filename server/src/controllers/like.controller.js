import mongoose from "mongoose";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Channel from "../models/Channel.js";
import createNotification from "../utils/createNotifications.js";

export const toggleVideoLike = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  // Validate Video ID
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  // Check if video exists
  const video = await Video.findById(videoId).populate({
    path: "channel",
    select: "channelName handle owner",
  });

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  // Check existing like
  const existingLike = await Like.findOne({
    user: req.user._id,
    video: videoId,
  });

  // =========================
  // UNLIKE
  // =========================
  if (existingLike) {
    await existingLike.deleteOne();

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { likes: -1 },
      },
      {
        returnDocument: "after",
      },
    );

    if (!updatedVideo) {
      return next(new ApiError(404, "Video not found"));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          liked: false,
          likes: updatedVideo.likes,
        },
        "Video unliked successfully",
      ),
    );
  }

  // =========================
  // LIKE
  // =========================
  await Like.create({
    user: req.user._id,
    video: videoId,
  });

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { likes: 1 },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedVideo) {
    return next(new ApiError(404, "Video not found"));
  }

  // =========================
  // NOTIFICATION
  // =========================
  const channelOwner = video.channel?.owner;

  if (channelOwner && channelOwner.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: channelOwner,
      sender: req.user._id,
      type: "like",
      title: "Someone liked your video",
      message: `${req.user.name} liked your video "${video.title}"`,
      video: video._id,
      channel: video.channel._id,
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: true,
        likes: updatedVideo.likes,
      },
      "Video liked successfully",
    ),
  );
});

export const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  // Validate Comment ID
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }

  // Check comment exists
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }

  // Check existing like
  const existingLike = await Like.findOne({
    user: req.user._id,
    comment: commentId,
  });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $inc: { likes: -1 },
      },
      {
        returnDocument: "after",
      },
    );
    if (!updatedComment) {
      return next(new ApiError(404, "Comment not found"));
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          liked: false,
          likes: updatedComment.likes,
        },
        "Comment unliked successfully",
      ),
    );
  }

  // Like
  await Like.create({
    user: req.user._id,
    comment: commentId,
  });

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $inc: { likes: 1 },
    },
    {
      returnDocument: "after",
    },
  );
  if (!updatedComment) {
    return next(new ApiError(404, "Comment not found"));
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: true,
        likes: updatedComment.likes,
      },
      "Comment liked successfully",
    ),
  );
});

export const checkVideoLikeStatus = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }
  const like = await Like.findOne({
    user: req.user._id,
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: !!like,
      },
      "Like status fetched successfully",
    ),
  );
});

export const getLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({
    user: req.user._id,
    video: { $ne: null },
  })
    .populate({
      path: "video",
      populate: {
        path: "channel",
        select: "channelName handle avatar isVerified subscribers",
      },
    })
    .sort({
      createdAt: -1,
    })
    .lean();

  // Remove likes whose video no longer exists
  const likedVideos = likes
    .filter((like) => like.video)
    .map((like) => like.video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully"),
    );
});

export const checkCommentLikeStatus = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }
  const like = await Like.findOne({
    user: req.user._id,
    comment: commentId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: !!like,
      },
      "Comment like status fetched successfully",
    ),
  );
});
