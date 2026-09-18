import { Video } from "@/types/video";

import formatViews from "@/lib/formatViews";
import formatTimeAgo from "@/lib/formatTimeAgo";

type VideoInfoProps = {
  video: Pick<
    Video,
    "title" | "views" | "createdAt" | "category"
  >;
};

export default function VideoInfo({
  video,
}: VideoInfoProps) {
  return (
    <section className="mt-5">
      {/* Title */}
      <h1 className="text-2xl font-bold leading-tight text-foreground">
        {video.title}
      </h1>

      {/* Metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          {formatViews(video.views)} views
        </span>

        <span>•</span>

        <span>{formatTimeAgo(video.createdAt)}</span>

        <span>•</span>

        <span className="rounded-full bg-muted px-3 py-1 font-medium text-foreground">
          {video.category}
        </span>
      </div>
    </section>
  );
}