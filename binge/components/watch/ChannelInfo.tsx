"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

import SubscribeButton from "@/components/channel/SubscribeButton";
import { Video } from "@/types/video";

type ChannelInfoProps = {
  video: Pick<Video, "channel">;
};

export default function ChannelInfo({
  video,
}: ChannelInfoProps) {
  const { channel } = video;

  const [subscribers, setSubscribers] =
    useState(channel.subscribers ?? 0);

  return (
    <section className="mt-6 border-b border-border pb-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}

        <div className="flex items-start gap-4">
          <Link
            href={`/channel/${channel.handle}`}
          >
            <Image
              src={channel.avatar}
              alt={channel.channelName}
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </Link>

          <div>
            <Link
              href={`/channel/${channel.handle}`}
              className="flex items-center gap-2"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {channel.channelName}
              </h2>

              {channel.isVerified && (
                <CheckCircle
                  size={18}
                  className="fill-muted-foreground text-background"
                />
              )}
            </Link>

            <p className="mt-1 text-sm text-muted-foreground">
              {subscribers.toLocaleString()}{" "}
              {subscribers === 1
                ? "subscriber"
                : "subscribers"}
            </p>

            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {channel.description}
            </p>
          </div>
        </div>

        {/* Right */}

        <SubscribeButton
          channelId={channel._id}
          setSubscribedCount={
            setSubscribers
          }
        />
      </div>
    </section>
  );
}