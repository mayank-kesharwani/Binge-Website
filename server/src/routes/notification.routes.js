import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get logged-in user's notifications
router.get(
  "/",
  authMiddleware,
  getNotifications
);

// Mark all notifications as read
router.patch(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

// Mark one notification as read
router.patch(
  "/:id/read",
  authMiddleware,
  markAsRead
);

// Delete all notifications
router.delete(
  "/all",
  authMiddleware,
  deleteAllNotifications
);

// Delete one notification
router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

export default router;