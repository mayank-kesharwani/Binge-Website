"use client";

import { useState } from "react";

import Image from "next/image";
import { CheckCircle, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import SubscribeButton from "./SubscribeButton";
import Link from "next/link";

type ChannelBannerProps = {
  channel: {
    _id: string;
    channelName: string;
    handle: string;
    avatar: string;
    banner: string;
    description: string;
    subscribers: number;
    totalVideos: number;
    isVerified: boolean;
    isSubscribed: boolean;
  };

  isOwner?: boolean;
};

export default function ChannelBanner({
  channel,
  isOwner = false,
}: ChannelBannerProps) {
  const bannerSrc = channel.banner?.trim() || null;

  const [subscribers, setSubscribers] = useState(
    channel.subscribers
  );

  const avatarSrc =
    channel.avatar?.trim() ||
    "https://ui-avatars.com/api/?background=dc2626&color=fff&name=User";

  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-background
        shadow-sm
      "
    >
      {/* Banner */}
      <div className="relative h-52 w-full md:h-72">
        {bannerSrc ? (
          <>
            <Image
              src={bannerSrc}
              alt={channel.channelName}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700" />
        )}
      </div>

      {/* Profile */}
      <div className="relative px-6 pb-8">
        {/* Avatar */}
        <div className="-mt-16 md:-mt-20">
          <Image
            src={avatarSrc}
            alt={channel.channelName}
            width={150}
            height={150}
            className="
              rounded-full
              border-4
              border-background
              shadow-xl
              transition
              duration-300
              hover:scale-105
            "
          />
        </div>

        {/* Content */}
        <div
          className="
            mt-5
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">
                {channel.channelName}
              </h1>

              {channel.isVerified && (
                <CheckCircle className="h-5 w-5 fill-blue-500 text-white" />
              )}
            </div>

            <p className="mt-1 text-muted-foreground">
              @{channel.handle}
            </p>

            <p className="mt-3 text-muted-foreground">
              {subscribers.toLocaleString()} subscribers •{" "}
              {channel.totalVideos} videos
            </p>

            <p className="mt-4 max-w-3xl text-foreground/80">
              {channel.description ||
                "No description added yet."}
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-wrap gap-3">
            {!isOwner ? (
              <SubscribeButton
                channelId={channel._id}
                setSubscribedCount={setSubscribers}
              />
            ) : (
              <Link href="/channel/edit">
                <Button
                  variant="outline"
                  className="
                    rounded-full
                    border-border
                    px-6
                    hover:border-red-500
                    hover:bg-red-50
                    hover:text-red-500
                  "
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Channel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}