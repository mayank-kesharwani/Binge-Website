import Image from "next/image";
import Link from "next/link";

import { Video } from "@/types/video";
import formatViews from "@/lib/formatViews";
import formatTimeAgo from "@/lib/formatTimeAgo";
import formatDuration from "@/lib/formatDuration";

type SuggestedVideoCardProps = {
  video: Video;
};

export default function SuggestedVideoCard({
  video,
}: SuggestedVideoCardProps) {
  return (
    <Link
      href={`/watch/${video._id}`}
      className="group flex gap-3 rounded-xl p-2 transition hover:bg-muted"
    >
      <div className="relative w-44 overflow-hidden rounded-xl">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={320}
          height={180}
          className="aspect-video rounded-xl object-cover transition group-hover:scale-105"
        />

        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {video.title}
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          {video.channel.channelName}
        </p>

        <p className="text-xs text-muted-foreground">
          {formatViews(video.views)} •{" "}
          {formatTimeAgo(video.createdAt)}
        </p>
      </div>
    </Link>
  );
}