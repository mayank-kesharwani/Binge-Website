import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  toggleVideoLike,
  toggleCommentLike,
  checkVideoLikeStatus,
  checkCommentLikeStatus,
  getLikedVideos,
} from "../controllers/like.controller.js";

const router = express.Router();

// Toggle Like
router.post("/video/:videoId", authMiddleware, toggleVideoLike);

router.post("/comment/:commentId", authMiddleware, toggleCommentLike);

// Like Status
router.get(
  "/video/status/:videoId",
  authMiddleware,
  checkVideoLikeStatus
);

router.get(
  "/comment/status/:commentId",
  authMiddleware,
  checkCommentLikeStatus
);

// Logged-in User's Liked Videos
router.get("/me", authMiddleware, getLikedVideos);

export default router;