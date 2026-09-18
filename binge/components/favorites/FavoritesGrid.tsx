"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Heart,
  MoreVertical,
  Play,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleVideoLike } from "@/services/like.service";
import type { Video } from "@/types/video";

interface FavoritesGridProps {
  videos: Video[];
  onFavoritesChange: (videoId: string) => void;
}

const FavoritesGrid = ({
  videos: initialVideos,
  onFavoritesChange,
}: FavoritesGridProps) => {
  const [videos, setVideos] =
    useState<Video[]>(initialVideos);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  const handleRemoveFavorite = async (
    videoId: string,
  ) => {
    if (removingId) return;

    try {
      setRemovingId(videoId);

      await toggleVideoLike(videoId);

      setVideos((currentVideos) =>
        currentVideos.filter(
          (video) => video._id !== videoId,
        ),
      );

      onFavoritesChange(videoId);

      toast.success("Removed from Favorites");
    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error,
      );

      toast.error("Failed to remove from Favorites");
    } finally {
      setRemovingId(null);
    }
  };

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {videos.map((video) => {
        const isRemoving =
          removingId === video._id;

        return (
          <article
            key={video._id}
            className="group relative flex w-full gap-3 border-b border-border py-4 first:pt-0 sm:gap-4 sm:py-5"
          >
            {/* Thumbnail */}
            <Link
              href={`/watch/${video._id}`}
              className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-52 md:w-64 lg:w-72"
            >
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 208px, (max-width: 1024px) 256px, 288px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Duration */}
              {video.duration > 0 && (
                <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
                  {Math.floor(video.duration / 60)}:
                  {String(
                    video.duration % 60,
                  ).padStart(2, "0")}
                </span>
              )}
            </Link>

            {/* Information */}
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3 sm:gap-5">
              <Link
                href={`/watch/${video._id}`}
                className="min-w-0 flex-1"
              >
                <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors duration-200 group-hover:text-red-500 sm:text-base">
                  {video.title}
                </h2>

                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                  <span className="truncate">
                    {video.channel?.channelName ||
                      "Binge Creator"}
                  </span>

                  {video.channel?.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 fill-muted-foreground text-background" />
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {video.views?.toLocaleString() || 0} views
                  {" • "}
                  {new Date(
                    video.createdAt,
                  ).toLocaleDateString()}
                </p>

                {video.description && (
                  <p className="mt-1 hidden max-w-2xl truncate text-xs text-muted-foreground md:block">
                    {video.description}
                  </p>
                )}
              </Link>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRemoving}
                  onClick={() =>
                    handleRemoveFavorite(
                      video._id,
                    )
                  }
                  className="h-9 rounded-full border-border px-3 text-xs font-medium text-foreground hover:bg-muted hover:text-red-500 sm:px-4 sm:text-sm"
                >
                  {isRemoving ? (
                    <>
                      <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      <span className="hidden sm:inline">
                        Removing...
                      </span>
                      <span className="sm:hidden">
                        ...
                      </span>
                    </>
                  ) : (
                    <>
                      <Heart className="mr-1.5 h-4 w-4 fill-red-500 text-red-500" />
                      <span>Unfavorite</span>
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  aria-label={`More options for ${video.title}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default FavoritesGrid;