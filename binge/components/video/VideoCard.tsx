import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Crown } from "lucide-react";

import VideoMenu from "@/components/video/VideoMenu";

import formatViews from "@/lib/formatViews";
import formatDuration from "@/lib/formatDuration";
import timeAgo from "@/lib/formatTimeAgo";

type VideoCardProps = {
  video: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
    views: number;
    createdAt: string;
    isPremium?: boolean;

    channel: {
      channelName: string;
      handle: string;
      avatar: string;
      isVerified: boolean;
    };
  };
};

export default function VideoCard({
  video,
}: VideoCardProps) {
  return (
    <div className="group cursor-pointer rounded-2xl p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50/40 hover:shadow-xl">

      {/* Thumbnail */}
      <Link
        href={`/watch/${video._id}`}
        className="block overflow-hidden rounded-2xl"
      >
        <div className="relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-xl">

          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={600}
            height={340}
            loading="lazy"
            sizes="(max-width:768px)100vw,
                   (max-width:1200px)50vw,
                   33vw"
            className="aspect-video w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
          />

          <span className="absolute bottom-3 right-3 rounded-md bg-black/85 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {formatDuration(video.duration)}
          </span>

        </div>
      </Link>

      {/* Details */}
      <div className="mt-3 flex gap-3">

        {/* Avatar */}
        <Link href={`/channel/${video.channel.handle}`}>
          <Image
            src={video.channel.avatar}
            alt={video.channel.channelName}
            width={44}
            height={44}
            loading="lazy"
            className="h-11 w-11 rounded-full border-2 border-transparent object-cover transition-all duration-300 group-hover:border-red-500"
          />
        </Link>

        {/* Content */}
        <div className="flex-1">

          <div className="flex items-start justify-between gap-2">

            <Link href={`/watch/${video._id}`}>
              <h3 className="line-clamp-2 text-[15px] font-semibold transition-all duration-300 group-hover:text-red-500">
                {video.title}
              </h3>
            </Link>

            <VideoMenu video={video} />

          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-red-400">
            <Link
              href={`/channel/${video.channel.handle}`}
              className="flex items-center gap-1"
            >
              <span>{video.channel.channelName}</span>

              {video.channel.isVerified && (
                <CheckCircle className="h-4 w-4 fill-muted-foreground text-background transition-transform duration-300 group-hover:scale-110" />
              )}
            </Link>

            {video.isPremium && (
              <Crown
                className="h-4 w-4 fill-red-500 text-red-500"
                aria-label="Premium video"
              />
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
            {formatViews(video.views)} views •{" "}
            {timeAgo(video.createdAt)}
          </p>

        </div>
      </div>
    </div>
  );
}