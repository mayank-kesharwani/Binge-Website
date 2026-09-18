"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import formatViews from "@/lib/formatViews";
import { formatDistanceToNow } from "date-fns";
import VisibilityBadge from "./VisibilityBadge";

type Props = {
  video: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    views: number;
    visibility: "public" | "private" | "unlisted";
    createdAt: string;
    isPremium?: boolean;

    channel: {
      channelName: string;
    };
  };

  onDelete: (id: string) => void;
};

export default function ManageVideoCard({
  video,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={320}
          height={180}
          className="
            aspect-video
            w-full
            rounded-xl
            object-cover
            md:h-32
            md:w-56
          "
        />

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {video.title}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {video.channel.channelName}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatViews(video.views)}
              </span>

              <VisibilityBadge
                visibility={video.visibility}
              />

              {video.isPremium && (
                <Crown
                  className="h-4 w-4 fill-red-500 text-red-500"
                  aria-label="Premium video"
                />
              )}

              <span>
                {formatDistanceToNow(
                  new Date(video.createdAt),
                  {
                    addSuffix: true,
                  },
                )}
              </span>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/manage/${video._id}/edit`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border-border bg-background text-foreground hover:bg-accent"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>

            <Button
              variant="destructive"
              onClick={() => onDelete(video._id)}
              className="h-11 flex-1 rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}