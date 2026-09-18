"use client";

import {
  MoreVertical,
  Clock3,
  Heart,
  Share2,
  Flag,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ShareDialog from "../watch/ShareDialog";

import {
  toggleWatchLater,
} from "@/services/watchLater.service";

import {
  toggleVideoLike,
} from "@/services/like.service";

type VideoMenuVideo = {
  _id: string;
  title: string;
  thumbnailUrl: string;
  isSaved?: boolean;
  isLiked?: boolean;
};

type VideoMenuProps = {
  video: VideoMenuVideo;
};

const VideoMenu = ({ video }: VideoMenuProps) => {
  const [showShareDialog, setShowShareDialog] =
    useState(false);

  const [isSaved, setIsSaved] = useState(
    Boolean(video.isSaved),
  );

  const [isFavorite, setIsFavorite] = useState(
    Boolean(video.isLiked),
  );

  const [isUpdatingWatchLater, setIsUpdatingWatchLater] =
    useState(false);

  const [isUpdatingFavorite, setIsUpdatingFavorite] =
    useState(false);

  const handleWatchLater = async () => {
    if (isUpdatingWatchLater) return;

    try {
      setIsUpdatingWatchLater(true);

      const response =
        await toggleWatchLater(video._id);

      const saved = Boolean(response?.data?.isSaved);

      setIsSaved(saved);

      toast.success(
        saved
          ? "Video added to Watch Later"
          : "Video removed from Watch Later",
      );
    } catch (error: any) {
      console.error(
        "Failed to update Watch Later:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update Watch Later",
      );
    } finally {
      setIsUpdatingWatchLater(false);
    }
  };

  const handleFavorite = async () => {
    if (isUpdatingFavorite) return;

    try {
      setIsUpdatingFavorite(true);

      const response =
        await toggleVideoLike(video._id);

      const liked =
        response?.data?.isLiked ??
        response?.data?.liked ??
        !isFavorite;

      setIsFavorite(Boolean(liked));

      toast.success(
        liked
          ? "Video added to Favorites"
          : "Video removed from Favorites",
      );
    } catch (error: any) {
      console.error(
        "Failed to update Favorites:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update Favorites",
      );
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl"
          >
            {/* Watch Later */}

            <DropdownMenuItem
              onClick={handleWatchLater}
              disabled={isUpdatingWatchLater}
              className="cursor-pointer rounded-lg text-foreground hover:bg-muted focus:bg-muted"
            >
              <Clock3 className="mr-3 h-4 w-4" />

              {isUpdatingWatchLater
                ? "Updating..."
                : isSaved
                  ? "Remove from Watch Later"
                  : "Watch Later"}
            </DropdownMenuItem>

            {/* Favorites */}

            <DropdownMenuItem
              onClick={handleFavorite}
              disabled={isUpdatingFavorite}
              className="cursor-pointer rounded-lg text-foreground hover:bg-muted focus:bg-muted"
            >
              <Heart
                className={`mr-3 h-4 w-4 ${
                  isFavorite
                    ? "fill-current text-red-500"
                    : ""
                }`}
              />

              {isUpdatingFavorite
                ? "Updating..."
                : isFavorite
                  ? "Remove from Favorites"
                  : "Save to Favorites"}
            </DropdownMenuItem>

            {/* Share */}

            <DropdownMenuItem
              onClick={handleShare}
              className="cursor-pointer rounded-lg text-foreground hover:bg-muted focus:bg-muted"
            >
              <Share2 className="mr-3 h-4 w-4" />
              Share
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Report */}

            <DropdownMenuItem className="cursor-pointer rounded-lg text-red-500 hover:bg-red-50 focus:bg-red-50">
              <Flag className="mr-3 h-4 w-4" />
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ShareDialog
        video={video}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </>
  );
};

export default VideoMenu;