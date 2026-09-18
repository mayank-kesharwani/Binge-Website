"use client";

import Image from "next/image";
import Link from "next/link";
import { Crown, Pencil } from "lucide-react";
import { format } from "date-fns";
import ManageVideoCard from "./ManageVideoCard";

import { Button } from "@/components/ui/button";
import VisibilityBadge from "./VisibilityBadge";
import DeleteVideoDialog from "./DeleteVideoDialog";
import formatViews from "@/lib/formatViews";

type Video = {
  _id: string;
  title: string;
  thumbnailUrl: string;
  visibility: "public" | "private" | "unlisted";
  views: number;
  createdAt: string;
  category?: string;
  isPremium?: boolean;

  channel: {
    channelName: string;
  };
};

type Props = {
  videos: Video[];
  onDelete: (id: string) => void;
};

export default function ManageVideoTable({
  videos,
  onDelete,
}: Props) {
  return (
    <>
      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {videos.map((video) => (
          <ManageVideoCard
            key={video._id}
            video={video}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-3xl border border-border bg-card shadow-sm md:block">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-muted">
            <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4 text-left">
                Thumbnail
              </th>

              <th className="px-6 py-4 text-left">
                Video
              </th>

              <th className="px-6 py-4 text-left">
                Visibility
              </th>

              <th className="px-6 py-4 text-left">
                Views
              </th>

              <th className="px-6 py-4 text-left">
                Uploaded
              </th>

              <th className="px-6 py-4 text-center">
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {videos.map((video) => (
              <tr
                key={video._id}
                className="
                  border-b
                  border-border
                  transition-colors
                  duration-200
                  hover:bg-muted/50
                "
              >
                {/* Thumbnail */}
                <td className="px-6 py-4">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    width={180}
                    height={100}
                    className="
                      h-24
                      w-44
                      rounded-xl
                      object-cover
                      shadow-sm
                    "
                  />
                </td>

                {/* Video */}
                <td className="px-6 py-4">
                  <h3 className="line-clamp-2 font-semibold text-foreground">
                    {video.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {video.channel.channelName}
                  </p>

                  {video.category && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {video.category}
                    </p>
                  )}
                </td>

                {/* Visibility */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <VisibilityBadge
                      visibility={video.visibility}
                    />

                    {video.isPremium && (
                      <Crown
                        className="h-4 w-4 fill-red-500 text-red-500"
                        aria-label="Premium video"
                      />
                    )}
                  </div>
                </td>

                {/* Views */}
                <td className="px-6 py-4 font-medium text-foreground">
                  {formatViews(video.views)}
                </td>

                {/* Uploaded */}
                <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                  {format(
                    new Date(video.createdAt),
                    "dd MMM yyyy",
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/manage/${video._id}/edit`}
                    >
                      <Button
                        size="icon"
                        variant="outline"
                        className="
                          rounded-full
                          border-border
                          bg-background
                          text-foreground
                          hover:border-red-500
                          hover:bg-red-50
                          hover:text-red-500
                        "
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>

                    <DeleteVideoDialog
                      onDelete={() =>
                        onDelete(video._id)
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}