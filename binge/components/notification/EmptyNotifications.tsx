"use client";

import { Bell } from "lucide-react";

export default function EmptyNotifications() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
        <Bell className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
        No notifications
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        You're all caught up. Notifications about
        subscriptions, videos, likes, comments, and
        account activity will appear here.
      </p>
    </div>
  );
}