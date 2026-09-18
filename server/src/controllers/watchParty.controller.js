import mongoose from "mongoose";

import WatchParty from "../models/WatchParty.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const generatePartyCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 8; i += 1) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return code;
};

const createUniquePartyCode = async () => {
  let partyCode;
  let exists = true;

  while (exists) {
    partyCode = generatePartyCode();

    exists = await WatchParty.exists({
      partyCode,
      status: "active",
    });
  }

  return partyCode;
};

export const createWatchParty = asyncHandler(
  async (req, res, next) => {
    const { videoId } = req.body;

    if (!videoId) {
      return next(
        new ApiError(400, "Video ID is required"),
      );
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return next(
        new ApiError(400, "Invalid video ID"),
      );
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return next(
        new ApiError(404, "Video not found"),
      );
    }

    if (video.isPublished === false) {
      return next(
        new ApiError(400, "This video is not available"),
      );
    }

    const existingParty = await WatchParty.findOne({
      host: req.user._id,
      video: videoId,
      status: "active",
    });

    if (existingParty) {
      return res.status(200).json(
        new ApiResponse(
          200,
          existingParty,
          "Active watch party already exists",
        ),
      );
    }

    const partyCode = await createUniquePartyCode();

    const watchParty = await WatchParty.create({
      host: req.user._id,
      video: videoId,
      partyCode,
      participants: [
        {
          user: req.user._id,
        },
      ],
    });

    const populatedParty = await WatchParty.findById(
      watchParty._id,
    )
      .populate({
        path: "host",
        select: "name username avatar",
      })
      .populate({
        path: "video",
        select:
          "title description videoUrl thumbnailUrl duration views channel",
      })
      .populate({
        path: "participants.user",
        select: "name username avatar",
      });

    return res.status(201).json(
      new ApiResponse(
        201,
        populatedParty,
        "Watch party created successfully",
      ),
    );
  },
);

export const joinWatchParty = asyncHandler(
  async (req, res, next) => {
    const { partyCode } = req.params;

    if (!partyCode) {
      return next(
        new ApiError(400, "Party code is required"),
      );
    }

    const watchParty = await WatchParty.findOne({
      partyCode: partyCode.toUpperCase(),
      status: "active",
    });

    if (!watchParty) {
      return next(
        new ApiError(404, "Watch party not found or has ended"),
      );
    }

    const alreadyJoined = watchParty.participants.some(
      (participant) =>
        participant.user.toString() ===
        req.user._id.toString(),
    );

    if (!alreadyJoined) {
      watchParty.participants.push({
        user: req.user._id,
      });

      await watchParty.save();
    }

    const populatedParty = await WatchParty.findById(
      watchParty._id,
    )
      .populate({
        path: "host",
        select: "name username avatar",
      })
      .populate({
        path: "video",
        select:
          "title description videoUrl thumbnailUrl duration views channel",
      })
      .populate({
        path: "participants.user",
        select: "name username avatar",
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        populatedParty,
        "Joined watch party successfully",
      ),
    );
  },
);

export const getWatchParty = asyncHandler(
  async (req, res, next) => {
    const { partyCode } = req.params;

    if (!partyCode) {
      return next(
        new ApiError(400, "Party code is required"),
      );
    }

    const watchParty = await WatchParty.findOne({
      partyCode: partyCode.toUpperCase(),
    })
      .populate({
        path: "host",
        select: "name username avatar",
      })
      .populate({
        path: "video",
        select:
          "title description videoUrl thumbnailUrl duration views channel",
      })
      .populate({
        path: "participants.user",
        select: "name username avatar",
      });

    if (!watchParty) {
      return next(
        new ApiError(404, "Watch party not found"),
      );
    }

    const isParticipant = watchParty.participants.some(
      (participant) =>
        participant.user._id.toString() ===
        req.user._id.toString(),
    );

    if (
      !isParticipant &&
      watchParty.host._id.toString() !==
        req.user._id.toString()
    ) {
      return next(
        new ApiError(
          403,
          "You are not a participant of this watch party",
        ),
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        watchParty,
        "Watch party fetched successfully",
      ),
    );
  },
);

export const endWatchParty = asyncHandler(
  async (req, res, next) => {
    const { partyCode } = req.params;

    if (!partyCode) {
      return next(
        new ApiError(400, "Party code is required"),
      );
    }

    const watchParty = await WatchParty.findOne({
      partyCode: partyCode.toUpperCase(),
      status: "active",
    });

    if (!watchParty) {
      return next(
        new ApiError(404, "Active watch party not found"),
      );
    }

    if (
      watchParty.host.toString() !==
      req.user._id.toString()
    ) {
      return next(
        new ApiError(
          403,
          "Only the host can end the watch party",
        ),
      );
    }

    watchParty.status = "ended";
    watchParty.endedAt = new Date();

    await watchParty.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        watchParty,
        "Watch party ended successfully",
      ),
    );
  },
);