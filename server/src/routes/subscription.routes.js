import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  toggleSubscription,
  getMySubscriptions,
  getChannelSubscribers,
  checkSubscriptionStatus,
} from "../controllers/subscription.controller.js";

const router = express.Router();

// Protected Routes
router.post("/:channelId", authMiddleware, toggleSubscription);

router.get("/me", authMiddleware, getMySubscriptions);

router.get("/status/:channelId", authMiddleware, checkSubscriptionStatus);

// Public Route
router.get("/channel/:channelId", getChannelSubscribers);

export default router;