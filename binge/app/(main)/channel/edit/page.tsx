"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import CreateChannelAvatar from "@/components/create-channel/CreateChannelAvatar";
import CreateChannelBanner from "@/components/create-channel/CreateChannelBanner";
import CreateChannelForm from "@/components/create-channel/CreateChannelForm";
import EditChannelActions from "@/components/create-channel/EditChannelActions";

import { getMyChannel } from "@/services/channel.service";

export default function EditChannelPage() {
  const [form, setForm] = useState({
    channelName: "",
    handle: "",
    description: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);

  const [banner, setBanner] = useState<File | null>(null);

  const [channel, setChannel] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await getMyChannel();

        const channel = response.data;

        setChannel(channel);

        setForm({
          channelName: channel.channelName,
          handle: channel.handle,
          description: channel.description,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600">
            Creator Studio
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Edit Channel
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-500">
            Update your channel information, profile picture and banner.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <CreateChannelAvatar
            avatar={avatar}
            setAvatar={setAvatar}
            initialAvatar={channel?.avatar}
          />
        </div>

        <div className="mb-10">
          <CreateChannelBanner
            banner={banner}
            setBanner={setBanner}
            initialBanner={channel?.banner}
          />
        </div>

        <div className="mb-10">
          <CreateChannelForm form={form} setForm={setForm} />
        </div>

        <EditChannelActions form={form} avatar={avatar} banner={banner} />
      </div>
    </ProtectedRoute>
  );
}
