import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  reactToComment,
  reportComment,
  translateComment,
  getReportedComments,
  moderateReportedComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get(
  "/moderation/reported",
  authMiddleware,
  getReportedComments,
);

router.patch(
  "/:commentId/moderation",
  authMiddleware,
  moderateReportedComment,
);
// =====================================================
// Public
// =====================================================

router.get("/:videoId", getComments);

// =====================================================
// Protected - Comments
// =====================================================

router.post("/:videoId", authMiddleware, addComment);

router.put("/:commentId", authMiddleware, updateComment);

router.delete("/:commentId", authMiddleware, deleteComment);

// =====================================================
// Protected - Reactions
// =====================================================

router.post(
  "/:commentId/reaction",
  authMiddleware,
  reactToComment,
);

// =====================================================
// Protected - Translation
// IMPORTANT: keep this before generic /:commentId routes
// =====================================================

router.post(
  "/translate/:commentId",
  authMiddleware,
  translateComment,
);

// =====================================================
// Protected - Reports
// =====================================================

router.post(
  "/:commentId/report",
  authMiddleware,
  reportComment,
);

export default router;