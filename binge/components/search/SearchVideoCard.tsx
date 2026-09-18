"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import VideoMenu from "@/components/video/VideoMenu";
import formatViews from "@/lib/formatViews";

type SearchVideoCardProps = {
  video: {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: number;
    views: number;
    createdAt: string;

    channel: {
      channelName: string;
      avatar: string;
      isVerified: boolean;
    };
  };
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export default function SearchVideoCard({
  video,
}: SearchVideoCardProps) {
  return (
    <div
      className="
        group rounded-2xl
        transition-all duration-300
        hover:bg-red-50/40
        dark:hover:bg-red-950/20
      "
    >
      <Link
        href={`/watch/${video._id}`}
        className="flex flex-col gap-5 p-3 lg:flex-row"
      >
        {/* Thumbnail */}

        <div className="relative w-full shrink-0 lg:w-[360px]">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={360}
            height={202}
            className="
              aspect-video w-full
              rounded-2xl object-cover
              transition-transform duration-300
              group-hover:scale-[1.02]
            "
          />

          <span
            className="
              absolute bottom-3 right-3
              rounded-md
              bg-black/80
              px-2 py-1
              text-xs font-semibold text-white
            "
          >
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Content */}

        <div className="flex flex-1 justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <h2
              className="
                line-clamp-2
                text-xl font-semibold
                text-foreground
                transition-colors duration-300
                group-hover:text-red-500
              "
            >
              {video.title}
            </h2>

            {/* Views + Date */}
            <p className="mt-2 text-sm text-muted-foreground">
              {formatViews(video.views)} views •{" "}
              {formatDistanceToNow(
                new Date(video.createdAt),
                {
                  addSuffix: true,
                }
              )}
            </p>

            {/* Channel */}
            <div className="mt-4 flex items-center gap-3">
              <Image
                src={video.channel.avatar}
                alt={video.channel.channelName}
                width={42}
                height={42}
                className="rounded-full"
              />

              <div
                className="
                  flex items-center gap-1
                  text-sm text-foreground
                "
              >
                <span>
                  {video.channel.channelName}
                </span>

                {video.channel.isVerified && (
                  <CheckCircle className="h-4 w-4 fill-blue-500 text-white" />
                )}
              </div>
            </div>

            {/* Description */}
            <p
              className="
                mt-4 line-clamp-3
                text-sm leading-6
                text-muted-foreground
              "
            >
              {video.description ||
                "No description available."}
            </p>
          </div>

          {/* Menu */}
          <div className="self-start">
            <VideoMenu />
          </div>
        </div>
      </Link>
    </div>
  );
}