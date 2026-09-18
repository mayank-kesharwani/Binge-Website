import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  toggleWatchLater,
  getWatchLaterStatus,
  getMyWatchLater,
  removeFromWatchLater,
} from "../controllers/watchLater.controller.js";

const router = express.Router();

// Get all Watch Later videos
router.get(
  "/me",
  authMiddleware,
  getMyWatchLater,
);

// Get Watch Later status for a video
router.get(
  "/status/:videoId",
  authMiddleware,
  getWatchLaterStatus,
);

// Add / remove video from Watch Later
router.post(
  "/:videoId",
  authMiddleware,
  toggleWatchLater,
);

// Remove a specific video from Watch Later
router.delete(
  "/:videoId",
  authMiddleware,
  removeFromWatchLater,
);

export default router;