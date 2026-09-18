"use client";

import { useEffect, useState } from "react";
import {
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/services/notification.service";

import type { Notification } from "@/types/notification";

import EmptyNotifications from "@/components/notification/EmptyNotifications";
import NotificationItem from "@/components/notification/NotificationItem";

import { Button } from "@/components/ui/button";

export default function NotificationList() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await getNotifications();

      setNotifications(response.data ?? []);
      setUnreadCount(response.unreadCount ?? 0);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error,
      );

      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigateFromNotification = (
    notification: Notification,
  ) => {
    if (notification.video?._id) {
      router.push(
        `/watch/${notification.video._id}`,
      );

      return;
    }

    if (notification.channel?.handle) {
      router.push(
        `/channel/${notification.channel.handle}`,
      );
    }
  };

  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const handleMarkAsRead = async (
    notification: Notification,
  ) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(
          notification._id,
        );

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  read: true,
                }
              : item,
          ),
        );

        setUnreadCount((prev) =>
          Math.max(prev - 1, 0),
        );
      }

      navigateFromNotification(notification);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to update notification",
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setUnreadCount(0);

      toast.success(
        "All notifications marked as read",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to mark notifications as read",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ==========================================
  // DELETE ONE
  // ==========================================

  const handleDelete = async (id: string) => {
    try {
      const notification =
        notifications.find(
          (item) => item._id === id,
        );

      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter(
          (item) => item._id !== id,
        ),
      );

      if (
        notification &&
        !notification.read
      ) {
        setUnreadCount((prev) =>
          Math.max(prev - 1, 0),
        );
      }

      toast.success("Notification deleted");
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to delete notification",
      );
    }
  };

  // ==========================================
  // DELETE ALL
  // ==========================================

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    try {
      setDeletingAll(true);

      await deleteAllNotifications();

      setNotifications([]);
      setUnreadCount(0);

      toast.success(
        "All notifications deleted",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to delete notifications",
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading notifications...
        </p>
      </div>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div>
      {/* Top actions */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {unreadCount === 0
            ? "You're all caught up"
            : `${unreadCount} unread notification${
                unreadCount === 1 ? "" : "s"
              }`}
        </p>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="rounded-xl"
            >
              {markingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}

              Mark all as read
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleDeleteAll}
            disabled={deletingAll}
            className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            {deletingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}

            Clear all
          </Button>
        </div>
      </div>

      {/* Notification list */}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}