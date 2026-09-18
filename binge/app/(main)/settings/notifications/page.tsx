"use client";

import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationList from "@/components/notification/NotificationList";

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Back */}
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Bell className="h-4 w-4" />
            Notifications
          </span>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Notifications
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Stay updated with activity across your Binge
            account.
          </p>
        </div>

        {/* Notification list */}
        <NotificationList />
      </div>
    </ProtectedRoute>
  );
}