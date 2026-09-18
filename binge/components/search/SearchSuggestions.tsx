"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { searchVideos } from "@/services/video.service";

type Video = {
  _id: string;
  title: string;
  channel: {
    channelName: string;
    handle: string;
  };
};

type Props = {
  query: string;
  onClose?: () => void;
};

export default function SearchSuggestions({
  query,
  onClose,
}: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setVideos([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await searchVideos(query);

        setVideos(response.data.slice(0, 6));
      } catch (err) {
        console.error(err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!query.trim()) return null;

  return (
    <div
      className="
        absolute top-full z-50 mt-2 w-full
        overflow-hidden rounded-2xl
        border border-border
        bg-card
        text-card-foreground
        shadow-xl
      "
    >
      {/* Loading */}
      {loading && (
        <div className="px-5 py-4 text-sm text-muted-foreground">
          Searching...
        </div>
      )}

      {/* No results */}
      {!loading && videos.length === 0 && (
        <div className="px-5 py-4 text-sm text-muted-foreground">
          No videos found
        </div>
      )}

      {/* Suggestions */}
      {!loading &&
        videos.map((video) => (
          <Link
            key={video._id}
            href={`/watch/${video._id}`}
            onClick={onClose}
            className="
              flex items-center gap-4
              px-5 py-3
              text-foreground
              transition
              hover:bg-red-50
              dark:hover:bg-red-950/20
            "
          >
            <Search
              className="
                h-4 w-4 shrink-0
                text-muted-foreground
              "
            />

            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-foreground">
                {video.title}
              </p>

              <p className="truncate text-sm text-muted-foreground">
                {video.channel.channelName}
              </p>
            </div>
          </Link>
        ))}
    </div>
  );
}