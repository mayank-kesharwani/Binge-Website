"use client";

import { useState } from "react";

import ChannelTabs from "./ChannelTabs";
import ChannelAbout from "./ChannelAbout";
import VideoGrid from "@/components/video/VideoGrid";

type Props = {
  channel: any;
  videos: any[];
};

export default function ChannelContent({
  channel,
  videos,
}: Props) {
  const [activeTab, setActiveTab] =
    useState("videos");

  return (
    <>
      <ChannelTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="mt-8">

        {activeTab === "videos" && (
          <VideoGrid videos={videos} />
        )}

        {activeTab === "about" && (
          <ChannelAbout channel={channel} />
        )}

        {activeTab === "shorts" && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-border
              bg-card
              py-20
              text-center
              text-muted-foreground
            "
          >
            🚀 Shorts coming soon...
          </div>
        )}

        {activeTab === "playlists" && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-border
              bg-card
              py-20
              text-center
              text-muted-foreground
            "
          >
            📂 Playlists coming soon...
          </div>
        )}

        {activeTab === "community" && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-border
              bg-card
              py-20
              text-center
              text-muted-foreground
            "
          >
            💬 Community coming soon...
          </div>
        )}

      </div>
    </>
  );
}