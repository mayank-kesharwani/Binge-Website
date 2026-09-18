import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  downloadVideo,
} from "../controllers/download.controller.js";

const router = express.Router();

// Download video
// Requires an authenticated user.
// Download limits are enforced by the controller
// according to the user's active membership plan.
router.get(
  "/:id",
  authMiddleware,
  downloadVideo,
);

export default router;