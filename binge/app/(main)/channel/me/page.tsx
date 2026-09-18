"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getMyChannel } from "@/services/channel.service";
import { getVideosByChannel } from "@/services/video.service";

import ChannelBanner from "@/components/channel/ChannelBanner";
import ChannelStats from "@/components/channel/ChannelStats";
import CreatorToolbar from "@/components/creator/CreatorToolbar";
import ChannelContent from "@/components/channel/ChannelContent";

export default function MyChannelPage() {
  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const channelRes = await getMyChannel();
        const channelData = channelRes.data;

        setChannel(channelData);

        const videosRes = await getVideosByChannel(
          channelData.handle
        );

        setVideos(videosRes.data);
      } catch (error: any) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load your channel"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-lg text-gray-500">
          Loading your channel...
        </p>
      </main>
    );
  }

  if (!channel) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-lg text-gray-500">
          Channel not found.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1800px] px-4 py-6">
      <ChannelBanner
        channel={channel}
        isOwner
      />

      <ChannelStats
        channel={channel}
      />

      <CreatorToolbar />

      <ChannelContent
        channel={channel}
        videos={videos}
      />
    </main>
  );
}