import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
  getMyProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getPreferences,
  updatePreferences,
  getMyDownloads,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get logged-in user's profile
router.get(
  "/me",
  authMiddleware,
  getMyProfile,
);

// Get logged-in user's downloads
router.get(
  "/downloads",
  authMiddleware,
  getMyDownloads,
);

// Update logged-in user's profile
router.put(
  "/me",
  authMiddleware,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateProfile,
);

router.put(
  "/password",
  authMiddleware,
  changePassword,
);

router.delete(
  "/me",
  authMiddleware,
  deleteAccount,
);

router.get(
  "/preferences",
  authMiddleware,
  getPreferences,
);

router.put(
  "/preferences",
  authMiddleware,
  updatePreferences,
);

export default router;