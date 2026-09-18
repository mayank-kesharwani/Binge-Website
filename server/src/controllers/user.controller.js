import User from "../models/User.js";
import Download from "../models/Download.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import bcrypt from "bcryptjs";
import {
  ALLOWED_THEMES,
  ALLOWED_LANGUAGES,
} from "../constants/preferences.js";

import createNotification from "../utils/createNotifications.js";

export const getMyProfile = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(
      req.user._id,
    ).select("-password");

    if (!user) {
      return next(
        new ApiError(404, "User not found"),
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          "Profile fetched successfully",
        ),
      );
  },
);

export const updateProfile = asyncHandler(
  async (req, res, next) => {
    const {
      name,
      username,
      email,
      bio,
    } = req.body;

    const avatar =
      req.files?.avatar?.[0];

    const user = await User.findById(
      req.user._id,
    );

    if (!user) {
      return next(
        new ApiError(404, "User not found"),
      );
    }

    const changes = [];

    // Name
    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return next(
          new ApiError(
            400,
            "Name is required",
          ),
        );
      }

      if (trimmedName !== user.name) {
        changes.push("name");
        user.name = trimmedName;
      }
    }

    // Username
    if (username !== undefined) {
      const normalizedUsername =
        username.trim().toLowerCase();

      if (normalizedUsername.length < 3) {
        return next(
          new ApiError(
            400,
            "Username must be at least 3 characters",
          ),
        );
      }

      if (
        normalizedUsername !==
        user.username
      ) {
        const existingUser =
          await User.findOne({
            username:
              normalizedUsername,
            _id: {
              $ne: user._id,
            },
          });

        if (existingUser) {
          return next(
            new ApiError(
              409,
              "Username already taken",
            ),
          );
        }

        changes.push("username");
        user.username =
          normalizedUsername;
      }
    }

    // Email
    if (email !== undefined) {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (
        normalizedEmail !== user.email
      ) {
        const existingEmail =
          await User.findOne({
            email: normalizedEmail,
            _id: {
              $ne: user._id,
            },
          });

        if (existingEmail) {
          return next(
            new ApiError(
              409,
              "Email already in use",
            ),
          );
        }

        changes.push("email");
        user.email =
          normalizedEmail;
      }
    }

    // Bio
    if (bio !== undefined) {
      const trimmedBio = bio.trim();

      if (trimmedBio !== user.bio) {
        changes.push("bio");
        user.bio = trimmedBio;
      }
    }

    // Avatar
    if (avatar) {
      if (
        user.avatarPublicId &&
        !user.avatar.includes(
          "ui-avatars.com",
        )
      ) {
        await deleteFromCloudinary(
          user.avatarPublicId,
        );
      }

      user.avatar = avatar.path;
      user.avatarPublicId =
        avatar.filename;

      changes.push("avatar");
    }

    // Nothing actually changed
    if (changes.length === 0) {
      const updatedUser =
        await User.findById(
          user._id,
        ).select("-password");

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedUser,
            "No profile changes detected",
          ),
        );
    }

    await user.save();

    const updatedUser =
      await User.findById(
        user._id,
      ).select("-password");

    // Create notification
    await createNotification({
      recipient: user._id,
      sender: user._id,
      type: "profile",
      title: "Profile updated",
      message:
        "Your profile was updated successfully.",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          "Profile updated successfully",
        ),
      );
  },
);

export const changePassword = asyncHandler(
  async (req, res, next) => {
    const SALT_ROUNDS = 10;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const current =
      currentPassword?.trim();

    const nextPassword =
      newPassword?.trim();

    const confirm =
      confirmPassword?.trim();

    if (
      !current ||
      !nextPassword ||
      !confirm
    ) {
      return next(
        new ApiError(
          400,
          "All password fields are required",
        ),
      );
    }

    if (nextPassword !== confirm) {
      return next(
        new ApiError(
          400,
          "Passwords do not match",
        ),
      );
    }

    if (nextPassword.length < 6) {
      return next(
        new ApiError(
          400,
          "Password must be at least 6 characters",
        ),
      );
    }

    if (nextPassword.length > 100) {
      return next(
        new ApiError(
          400,
          "Password must be less than 100 characters",
        ),
      );
    }

    if (current === nextPassword) {
      return next(
        new ApiError(
          400,
          "New password must be different from current password",
        ),
      );
    }

    const user =
      await User.findById(
        req.user._id,
      ).select("+password");

    if (!user) {
      return next(
        new ApiError(404, "User not found"),
      );
    }

    const isMatch =
      await bcrypt.compare(
        current,
        user.password,
      );

    if (!isMatch) {
      return next(
        new ApiError(
          400,
          "Current password is incorrect",
        ),
      );
    }

    user.password =
      await bcrypt.hash(
        nextPassword,
        SALT_ROUNDS,
      );

    await user.save({
      validateBeforeSave: false,
    });

    await createNotification({
      recipient: user._id,
      sender: user._id,
      type: "password",
      title: "Password changed",
      message:
        "Your account password was changed successfully.",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Password changed successfully",
        ),
      );
  },
);

export const deleteAccount = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(
      req.user._id,
    );

    if (!user) {
      return next(
        new ApiError(404, "User not found"),
      );
    }

    await User.findByIdAndDelete(
      user._id,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Account deleted successfully",
        ),
      );
  },
);

export const getPreferences = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(
      req.user._id,
    );

    if (!user) {
      return next(
        new ApiError(404, "User not found"),
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user.preferences,
          "Preferences fetched successfully",
        ),
      );
  },
);

export const updatePreferences =
  asyncHandler(async (req, res, next) => {
    const {
      theme,
      autoplay,
      inlinePlayback,
      rememberProgress,
      language,
      notifications,
    } = req.body;

    // Theme validation
    if (
      theme !== undefined &&
      !ALLOWED_THEMES.includes(theme)
    ) {
      return next(
        new ApiError(400, "Invalid theme"),
      );
    }

    // Language validation
    if (
      language !== undefined &&
      !ALLOWED_LANGUAGES.includes(
        language,
      )
    ) {
      return next(
        new ApiError(
          400,
          "Invalid language",
        ),
      );
    }

    const user = await User.findById(
      req.user._id,
    );

    if (!user) {
      return next(
        new ApiError(404, "User not found"),
      );
    }

    if (theme !== undefined) {
      user.preferences.theme = theme;
    }

    if (autoplay !== undefined) {
      user.preferences.autoplay =
        autoplay;
    }

    if (inlinePlayback !== undefined) {
      user.preferences.inlinePlayback =
        inlinePlayback;
    }

    if (rememberProgress !== undefined) {
      user.preferences.rememberProgress =
        rememberProgress;
    }

    if (language !== undefined) {
      user.preferences.language =
        language;
    }

    if (notifications !== undefined) {
      if (
        typeof notifications !==
        "object"
      ) {
        return next(
          new ApiError(
            400,
            "Invalid notification preferences",
          ),
        );
      }

      const allowedNotificationKeys = [
        "newVideos",
        "newSubscribers",
        "likes",
        "comments",
        "replies",
        "accountUpdates",
        "systemUpdates",
      ];

      for (const key of allowedNotificationKeys) {
        if (
          notifications[key] !==
            undefined &&
          typeof notifications[key] !==
            "boolean"
        ) {
          return next(
            new ApiError(
              400,
              `Invalid notification preference: ${key}`,
            ),
          );
        }
      }

      for (const key of allowedNotificationKeys) {
        if (
          notifications[key] !==
          undefined
        ) {
          user.preferences.notifications[
            key
          ] = notifications[key];
        }
      }
    }

    await user.save();

    await createNotification({
      recipient: user._id,
      sender: user._id,
      type: "preferences",
      title: "Preferences updated",
      message:
        "Your Binge preferences were updated successfully.",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user.preferences,
          "Preferences updated successfully",
        ),
      );
  });

// =====================================================
// Downloads
// =====================================================

export const getMyDownloads =
  asyncHandler(async (req, res, next) => {
    const downloads =
      await Download.find({
        user: req.user._id,
      })
        .select(
          "video plan videoTitle videoPublicId videoUrl thumbnail downloadedAt createdAt",
        )
        .sort({
          downloadedAt: -1,
        })
        .lean();

    const downloadHistory =
      downloads.map((download) => ({
        id: download._id,
        videoId: download.video,
        title:
          download.videoTitle ||
          "Binge Video",
        videoPublicId:
          download.videoPublicId || "",
        videoUrl:
          download.videoUrl || "",
        thumbnail:
          download.thumbnail || "",
        plan: download.plan,
        downloadedAt:
          download.downloadedAt,
        createdAt:
          download.createdAt,
      }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          downloadHistory,
          "Downloads fetched successfully",
        ),
      );
  });