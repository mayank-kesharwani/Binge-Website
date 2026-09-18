"use client";

import { useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import CreateChannelAvatar from "@/components/create-channel/CreateChannelAvatar";
import CreateChannelBanner from "@/components/create-channel/CreateChannelBanner";
import CreateChannelForm from "@/components/create-channel/CreateChannelForm";
import CreateChannelActions from "@/components/create-channel/CreateChannelActions";

export default function CreateChannelPage() {
  const [form, setForm] = useState({
    channelName: "",
    handle: "",
    description: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);

  const [banner, setBanner] = useState<File | null>(null);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-10 text-center">

            <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
              Creator Studio
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
              Create Your Channel
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Create your creator identity on{" "}
              <span className="font-semibold text-red-500">
                Binge
              </span>
              . Upload a profile picture, customize your banner,
              choose a unique handle, and start sharing your
              videos with the world.
            </p>

          </div>

          {/* Avatar */}
          <div className="mb-10 flex justify-center">
            <CreateChannelAvatar
              avatar={avatar}
              setAvatar={setAvatar}
            />
          </div>

          {/* Banner */}
          <div className="mb-10">
            <CreateChannelBanner
              banner={banner}
              setBanner={setBanner}
            />
          </div>

          {/* Channel Details */}
          <div className="mb-10">
            <CreateChannelForm
              form={form}
              setForm={setForm}
            />
          </div>

          {/* Bottom Actions */}
          <CreateChannelActions
            form={form}
            avatar={avatar}
            banner={banner}
          />

        </div>
      </main>
    </ProtectedRoute>
  );
}