import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotifications.js";
import { moderateComment } from "../utils/moderateComment.js";
import CommentReaction from "../models/CommentReaction.js";
import CommentReport from "../models/CommentReport.js";
import { translateText } from "../utils/translateText.js";

const canModerateComment = (comment, user) => {
  const ownerId = comment.video?.channel?.owner?.toString();

  return ownerId === user._id.toString();
};

export const addComment = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const cleanText = text?.trim();

  if (!cleanText) {
    return next(new ApiError(400, "Comment cannot be empty"));
  }

  if (cleanText.length > 1000) {
    return next(new ApiError(400, "Comment cannot exceed 1000 characters"));
  }

  const moderation = moderateComment(cleanText);

  if (!moderation.allowed) {
    return next(new ApiError(400, moderation.reason));
  }

  const video = await Video.findById(videoId).populate({
    path: "channel",
    select: "channelName handle avatar owner",
  });

  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  const comment = await Comment.create({
    video: video._id,
    user: req.user._id,
    text: cleanText,
    language: req.body.language || "auto",
  });

  if (
    video.channel?.owner &&
    video.channel.owner.toString() !== req.user._id.toString()
  ) {
    await createNotification({
      recipient: video.channel.owner,
      sender: req.user._id,
      type: "comment",
      title: "New comment",
      message: `${req.user.name} commented on your video "${video.title}"`,
      video: video._id,
      channel: video.channel._id,
    });
  }

  await comment.populate({
    path: "user",
    select: "name username avatar",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  const comments = await Comment.find({
    video: videoId,
    isHidden: false,
    moderationStatus: {
      $ne: "rejected",
    },
  })
    .populate({
      path: "user",
      select: "name username avatar",
    })
    .sort({
      createdAt: -1,
    })
    .lean();

  let reactions = [];

  if (req.user?._id) {
    reactions = await CommentReaction.find({
      user: req.user._id,
      comment: {
        $in: comments.map((comment) => comment._id),
      },
    })
      .select("comment type")
      .lean();
  }

  const reactionMap = new Map(
    reactions.map((reaction) => [
      reaction.comment.toString(),
      reaction.type,
    ]),
  );

  const formattedComments = comments.map((comment) => ({
    ...comment,
    userReaction:
      reactionMap.get(comment._id.toString()) || null,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      formattedComments,
      "Comments fetched successfully",
    ),
  );
});

export const updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }

  const cleanText = text?.trim();

  if (!cleanText) {
    return next(new ApiError(400, "Comment cannot be empty"));
  }

  if (cleanText.length > 1000) {
    return next(new ApiError(400, "Comment cannot exceed 1000 characters"));
  }

  const moderation = moderateComment(cleanText);

  if (!moderation.allowed) {
    return next(new ApiError(400, moderation.reason));
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(403, "You are not authorized to update this comment"),
    );
  }

  comment.text = cleanText;
  comment.isEdited = true;
  comment.language = req.body.language || "auto";

  await comment.save();

  await comment.populate({
    path: "user",
    select: "name username avatar",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(403, "You are not authorized to delete this comment"),
    );
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

// =====================================================
// Like / Dislike Comment
// =====================================================

export const reactToComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { type } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }

  if (!["like", "dislike"].includes(type)) {
    return next(new ApiError(400, "Reaction must be like or dislike"));
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }

  const userId = req.user._id;

  const existingReaction = await CommentReaction.findOne({
    user: userId,
    comment: commentId,
  });

  if (existingReaction && existingReaction.type === type) {
    await existingReaction.deleteOne();

    if (type === "like") {
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }

    await comment.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          likes: comment.likes,
          dislikes: comment.dislikes,
          reaction: null,
        },
        "Reaction removed",
      ),
    );
  }

  if (existingReaction) {
    const oldType = existingReaction.type;

    existingReaction.type = type;

    await existingReaction.save();

    if (oldType === "like") {
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }

    if (type === "like") {
      comment.likes += 1;
    } else {
      comment.dislikes += 1;
    }

    await comment.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          likes: comment.likes,
          dislikes: comment.dislikes,
          reaction: type,
        },
        "Reaction updated",
      ),
    );
  }

  await CommentReaction.create({
    user: userId,
    comment: commentId,
    type,
  });

  if (type === "like") {
    comment.likes += 1;
  } else {
    comment.dislikes += 1;
  }

  await comment.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likes: comment.likes,
        dislikes: comment.dislikes,
        reaction: type,
      },
      "Reaction added",
    ),
  );
});

// =====================================================
// Report Comment
// =====================================================

export const reportComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { reason, details = "" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }

  const validReasons = [
    "abuse",
    "spam",
    "hate",
    "harassment",
    "sexual",
    "violence",
    "other",
  ];

  if (!validReasons.includes(reason)) {
    return next(new ApiError(400, "Invalid report reason"));
  }

  if (details.length > 500) {
    return next(
      new ApiError(400, "Report details cannot exceed 500 characters"),
    );
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }

  if (comment.user.toString() === req.user._id.toString()) {
    return next(new ApiError(400, "You cannot report your own comment"));
  }

  const existingReport = await CommentReport.findOne({
    comment: commentId,
    reporter: req.user._id,
  });

  if (existingReport) {
    return next(new ApiError(409, "You have already reported this comment"));
  }

  await CommentReport.create({
    comment: commentId,
    reporter: req.user._id,
    reason,
    details: details.trim(),
  });

  await Comment.findByIdAndUpdate(commentId, {
    $set: {
      isReported: true,
      moderationStatus: "pending",
    },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      null,
      "Comment reported successfully. It has been flagged for review.",
    ),
  );
});

// =====================================================
// Translate Comment
// =====================================================

export const translateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { targetLanguage } = req.body;

  // -----------------------------------------
  // Validate comment ID
  // -----------------------------------------

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new ApiError(400, "Invalid comment ID"));
  }

  // -----------------------------------------
  // Validate target language
  // -----------------------------------------

  if (!targetLanguage || typeof targetLanguage !== "string") {
    return next(new ApiError(400, "Target language is required"));
  }

  const language = targetLanguage.trim().toLowerCase();

  const supportedLanguages = ["en", "hi"];

  if (!supportedLanguages.includes(language)) {
    return next(new ApiError(400, "Unsupported target language"));
  }

  // -----------------------------------------
  // Find comment
  // -----------------------------------------

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new ApiError(404, "Comment not found"));
  }

  // -----------------------------------------
  // Detect source language
  // -----------------------------------------

  let sourceLanguage = "auto";

  /*
   * Devanagari characters are a reliable indicator
   * for Hindi text.
   */
  if (/[\u0900-\u097F]/.test(comment.text)) {
    sourceLanguage = "hi";
  } else {
    sourceLanguage = "en";
  }

  // -----------------------------------------
  // Already in requested language
  // -----------------------------------------

  if (sourceLanguage === language) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          translatedText: comment.text,
          sourceLanguage,
          targetLanguage: language,
        },
        "Comment is already in the selected language",
      ),
    );
  }

  // -----------------------------------------
  // Translate
  // -----------------------------------------

  const translatedText = await translateText(
    comment.text,
    sourceLanguage,
    language,
  );

  // -----------------------------------------
  // Response
  // -----------------------------------------

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        translatedText,
        sourceLanguage,
        targetLanguage: language,
      },
      "Comment translated successfully",
    ),
  );
});

// =====================================================
// Get reported comments for moderation
// =====================================================

export const getReportedComments = asyncHandler(
  async (req, res, next) => {
    const reports = await CommentReport.find({
      status: "pending",
    })
      .populate({
        path: "reporter",
        select: "name username avatar",
      })
      .populate({
        path: "comment",
        populate: [
          {
            path: "user",
            select: "name username avatar",
          },
          {
            path: "video",
            select: "title channel",
            populate: {
              path: "channel",
              select: "channelName owner",
            },
          },
        ],
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    const filteredReports = reports.filter(
      (report) => {
        const ownerId =
          report.comment?.video?.channel?.owner?.toString();

        return ownerId === req.user._id.toString();
      },
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        filteredReports,
        "Reported comments fetched successfully",
      ),
    );
  },
);

export const moderateReportedComment = asyncHandler(
  async (req, res, next) => {
    const { commentId } = req.params;
    const { action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return next(
        new ApiError(400, "Invalid comment ID"),
      );
    }

    const validActions = [
      "approve",
      "remove",
      "dismiss",
    ];

    if (!validActions.includes(action)) {
      return next(
        new ApiError(400, "Invalid moderation action"),
      );
    }

    const comment = await Comment.findById(commentId)
      .populate({
        path: "video",
        select: "channel",
        populate: {
          path: "channel",
          select: "owner",
        },
      });

    if (!comment) {
      return next(
        new ApiError(404, "Comment not found"),
      );
    }

    if (!canModerateComment(comment, req.user._id)) {
      return next(
        new ApiError(
          403,
          "You are not authorized to moderate this comment",
        ),
      );
    }

    if (action === "approve") {
      comment.isReported = false;
      comment.isHidden = false;
      comment.moderationStatus = "approved";

      await comment.save();

      await CommentReport.updateMany(
        {
          comment: commentId,
          status: "pending",
        },
        {
          $set: {
            status: "dismissed",
          },
        },
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          comment,
          "Comment approved",
        ),
      );
    }

    if (action === "remove") {
      comment.isReported = false;
      comment.isHidden = true;
      comment.moderationStatus = "rejected";

      await comment.save();

      await CommentReport.updateMany(
        {
          comment: commentId,
          status: "pending",
        },
        {
          $set: {
            status: "action_taken",
          },
        },
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          comment,
          "Comment removed",
        ),
      );
    }

    comment.isReported = false;
    comment.isHidden = false;
    comment.moderationStatus = "approved";

    await comment.save();

    await CommentReport.updateMany(
      {
        comment: commentId,
        status: "pending",
      },
      {
        $set: {
          status: "dismissed",
        },
      },
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        comment,
        "Report dismissed",
      ),
    );
  },
);