import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createMembershipOrder,
  verifyMembershipPayment,
  getMembershipPlans,
  getMyMembership,
  getMyPaymentHistory,
} from "../controllers/membership.controller.js";

import {
  getWatchTimeUsage,
  startWatchSession,
  heartbeatWatchSession,
  stopWatchSession,
} from "../controllers/membershipWatchTime.controller.js";

const router = express.Router();

// Get all membership plans
router.get("/plans", getMembershipPlans);

// Get logged-in user's membership
router.get(
  "/me",
  authMiddleware,
  getMyMembership,
);

// Get logged-in user's payment history
router.get(
  "/payments",
  authMiddleware,
  getMyPaymentHistory,
);

// Create Razorpay membership order
router.post(
  "/create-order",
  authMiddleware,
  createMembershipOrder,
);

// Verify Razorpay payment
router.post(
  "/verify-payment",
  authMiddleware,
  verifyMembershipPayment,
);

// =====================================================
// Watch Time
// =====================================================

// Get current watch-time usage
router.get(
  "/watch-time",
  authMiddleware,
  getWatchTimeUsage,
);

// Start server-tracked watch session
router.post(
  "/watch-time/start",
  authMiddleware,
  startWatchSession,
);

// Server-calculated watch-time heartbeat
router.post(
  "/watch-time/heartbeat",
  authMiddleware,
  heartbeatWatchSession,
);

// Stop server-tracked watch session
router.post(
  "/watch-time/stop",
  authMiddleware,
  stopWatchSession,
);

export default router;