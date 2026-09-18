"use client";

import {
  Bell,
  Check,
  Trash2,
  Video,
  User,
  MessageCircle,
  ThumbsUp,
  Settings,
  Reply,
  Shield,
  Radio,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/notification";

type NotificationItemProps = {
  notification: Notification;
  onRead: (notification: Notification) => void;
  onDelete: (id: string) => void;
};

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "new_video":
      case "video":
        return <Video className="h-5 w-5" />;

      case "subscription":
        return <User className="h-5 w-5" />;

      case "like":
        return <ThumbsUp className="h-5 w-5" />;

      case "comment":
        return <MessageCircle className="h-5 w-5" />;

      case "reply":
        return <Reply className="h-5 w-5" />;

      case "profile":
      case "channel":
        return <User className="h-5 w-5" />;

      case "password":
      case "preferences":
        return <Settings className="h-5 w-5" />;

      case "system":
        return <Shield className="h-5 w-5" />;

      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleClick = () => {
    onRead(notification);
  };

  return (
    <div
      className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all ${
        notification.read
          ? "border-border bg-background hover:bg-muted/50"
          : "border-red-500/40 bg-red-950/20 hover:bg-red-950/30"
      }`}
    >
      {/* Notification icon */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          notification.read
            ? "bg-muted text-muted-foreground"
            : "bg-red-950/60 text-red-500"
        }`}
      >
        {getIcon()}
      </div>

      {/* Content */}
      <button
        type="button"
        onClick={handleClick}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <h3
            className={`text-base font-semibold ${
              notification.read
                ? "text-foreground"
                : "text-red-400"
            }`}
          >
            {notification.title}
          </h3>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {formatNotificationDate(
                notification.createdAt,
              )}
            </span>

            {!notification.read && (
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </div>
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {notification.message}
        </p>
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onRead(notification);
            }}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-950/40 hover:text-red-400"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(notification._id);
          }}
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-950/40 hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function formatNotificationDate(date: string) {
  const created = new Date(date);
  const now = new Date();

  const diff = now.getTime() - created.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return created.toLocaleDateString();
}