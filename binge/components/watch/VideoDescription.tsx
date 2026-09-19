"use client";

import { useState } from "react";

import formatViews from "@/lib/formatViews";
import formatTimeAgo from "@/lib/formatTimeAgo";

import { Video } from "@/types/video";

type VideoDescriptionProps = {
  video: Pick<
    Video,
    "description" | "views" | "createdAt"
  >;
};

export default function VideoDescription({
  video,
}: VideoDescriptionProps) {
  const [expanded, setExpanded] =
    useState(false);

  return (
    <section className="mt-6 rounded-2xl bg-muted p-5">
      {/* Meta */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>
          {formatViews(video.views)} views
        </span>

        <span>•</span>

        <span>
          {formatTimeAgo(video.createdAt)}
        </span>
      </div>

      {/* Description */}
      <p
        className={`whitespace-pre-wrap text-foreground ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {video.description}
      </p>

      {/* Button */}
      {video.description.length > 180 && (
        <button
          type="button"
          onClick={() =>
            setExpanded(!expanded)
          }
          className="mt-3 text-sm font-semibold text-foreground hover:text-red-500 hover:underline"
        >
          {expanded
            ? "Show less"
            : "Show more"}
        </button>
      )}
    </section>
  );
}