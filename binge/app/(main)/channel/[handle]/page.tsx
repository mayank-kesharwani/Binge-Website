import { notFound } from "next/navigation";

import { getChannelByHandle } from "@/services/channel.service";
import { getVideosByChannel } from "@/services/video.service";

import ChannelBanner from "@/components/channel/ChannelBanner";
import ChannelStats from "@/components/channel/ChannelStats";
import ChannelContent from "@/components/channel/ChannelContent";

type ChannelPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { handle } = await params;

  const [channelResponse, videosResponse] = await Promise.all([
    getChannelByHandle(handle),
    getVideosByChannel(handle),
  ]);

  const channel = channelResponse.data;
  const videos = videosResponse.data;

  if (!channel) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1800px] px-4 py-6">
      <ChannelBanner channel={channel} isOwner={channel.isOwner} />

      <div className="mt-8">
        <ChannelStats channel={channel} />

        <ChannelContent channel={channel} videos={videos} />
      </div>
    </main>
  );
}
