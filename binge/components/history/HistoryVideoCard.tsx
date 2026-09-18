"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Trash2 } from "lucide-react";
import VideoMenu from "../video/VideoMenu";
import { removeFromHistory } from "@/services/history.service";
import { toast } from "sonner";

type Props = {
  item: any;
  onHistoryChange: () => void;
};

const HistoryVideoCard = ({
  item,
  onHistoryChange,
}: Props) => {
  const video = item.video;

  if (!video) return null;

  const handleRemove = async () => {
    try {
      await removeFromHistory(video._id);

      toast.success("Removed from history");

      onHistoryChange();
    } catch (error) {
      console.error(
        "Failed to remove history item:",
        error,
      );

      toast.error("Failed to remove from history");
    }
  };

  return (
    <article className="group relative flex w-full gap-3 border-b border-border py-2.5 first:pt-0 sm:gap-4 sm:py-3">
      {/* Thumbnail */}
      <Link
        href={`/watch/${video._id}`}
        className="relative block aspect-video w-[140px] shrink-0 overflow-hidden rounded-lg bg-muted sm:w-[200px] md:w-[220px] lg:w-[250px] xl:w-[280px]"
      >
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="
            (max-width: 639px) 140px,
            (max-width: 767px) 200px,
            (max-width: 1023px) 220px,
            (max-width: 1279px) 250px,
            280px
          "
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Duration */}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white sm:bottom-2 sm:right-2 sm:text-[11px]">
          {formatDuration(video.duration)}
        </span>
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 justify-between gap-2 sm:gap-3">
        <Link
          href={`/watch/${video._id}`}
          className="min-w-0 flex-1"
        >
          {/* Title */}
          <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors duration-200 group-hover:text-red-500 sm:text-base sm:leading-5">
            {video.title}
          </h2>

          {/* Channel */}
          {video.channel && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
              <span className="truncate">
                {video.channel.channelName}
              </span>

              {video.channel.isVerified && (
                <CheckCircle className="h-3.5 w-3.5 shrink-0 fill-current text-muted-foreground" />
              )}
            </div>
          )}

          {/* Views + watched date */}
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:gap-1.5 sm:text-sm">
            <span>
              {formatViews(video.views)} views
            </span>

            <span>•</span>

            <span>
              Watched{" "}
              {formatHistoryDate(item.watchedAt)}
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex shrink-0 items-start gap-0.5">
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove from history"
            title="Remove from history"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="flex h-8 w-8 items-center justify-center">
            <VideoMenu video={video} />
          </div>
        </div>
      </div>
    </article>
  );
};

// =============================================
// Duration
// =============================================

function formatDuration(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) {
    return "0:00";
  }

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  const remainingSeconds = Math.floor(
    seconds % 60,
  );

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

// =============================================
// Views
// =============================================

function formatViews(views: number) {
  if (!views) return "0";

  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }

  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }

  return views.toString();
}

// =============================================
// History date
// =============================================

function formatHistoryDate(dateString: string) {
  if (!dateString) return "recently";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(
    diff / 1000 / 60,
  );

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !==
      new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

export default HistoryVideoCard;