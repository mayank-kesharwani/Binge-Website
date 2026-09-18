"use client";

import { Bell } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { PreferenceForm } from "@/types/user";

type Props = {
  form: PreferenceForm;
  setForm: React.Dispatch<
    React.SetStateAction<PreferenceForm>
  >;
};

const notificationItems = [
  {
    key: "newVideos",
    title: "New videos from subscriptions",
    description:
      "Get notified when a channel you subscribe to uploads a new video.",
  },
  {
    key: "newSubscribers",
    title: "New subscribers",
    description:
      "Get notified when someone subscribes to your channel.",
  },
  {
    key: "likes",
    title: "Video likes",
    description:
      "Get notified when someone likes your videos.",
  },
  {
    key: "comments",
    title: "Comments",
    description:
      "Get notified when someone comments on your videos.",
  },
  {
    key: "replies",
    title: "Comment replies",
    description:
      "Get notified when someone replies to your comments.",
  },
  {
    key: "accountUpdates",
    title: "Account & security",
    description:
      "Receive important updates about your account, profile and security.",
  },
  {
    key: "systemUpdates",
    title: "Binge updates",
    description:
      "Receive important product, feature and system updates.",
  },
] as const;

export default function NotificationPreferencesCard({
  form,
  setForm,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Notification Preferences
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose which notifications you want to receive.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {notificationItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start gap-4 p-5 sm:p-6"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <Label className="min-w-0 flex-1 text-base font-semibold leading-5 text-foreground">
                  {item.title}
                </Label>

                <Switch
                  className="mt-0.5 shrink-0"
                  checked={form.notifications[item.key]}
                  onCheckedChange={(checked) => {
                    setForm((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [item.key]: checked,
                      },
                    }));
                  }}
                />
              </div>

              <p className="mt-1.5 pr-1 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}