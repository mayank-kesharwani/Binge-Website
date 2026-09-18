import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";


import {
  createChannel,
  getMyChannel,
  updateChannel,
  getChannelByHandle,
} from "../controllers/channel.controller.js";

import optionalAuth from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

// Protected Routes
router.post(
  "/",
  authMiddleware,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "banner",
      maxCount: 1,
    },
  ]),
  createChannel
);

router.get("/me", authMiddleware, getMyChannel);

router.put(
  "/me",
  authMiddleware,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "banner",
      maxCount: 1,
    },
  ]),
  updateChannel
);

// Public Route
router.get("/:handle",
  optionalAuth,
  getChannelByHandle);

export default router;