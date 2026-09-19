"use client";

import {
  Bookmark,
  Download,
  Ellipsis,
  PartyPopper,
  Share2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import LikeButton from "../video/LikeButton";
import ShareDialog from "./ShareDialog";
import formatViews from "@/lib/formatViews";
import api from "@/lib/axios";
import { Video } from "@/types/video";
import { createWatchParty } from "@/services/watchParty.service";
import {
  toggleWatchLater,
  getWatchLaterStatus,
} from "@/services/watchLater.service";

import { useAuthStore } from "@/store/authStore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type VideoActionsProps = {
  video: Video;
};

export default function VideoActions({
  video,
}: VideoActionsProps) {
  const router = useRouter();

  const { user, hasHydrated } = useAuthStore();

  const [likes, setLikes] = useState(video.likes);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isCreatingParty, setIsCreatingParty] =
    useState(false);

  const [isSaved, setIsSaved] = useState(
    Boolean(video.isSaved),
  );

  const [isSaving, setIsSaving] = useState(false);

  const [showShareDialog, setShowShareDialog] =
    useState(false);

  // ===================================================
  // Sync initial saved state
  // ===================================================

  useEffect(() => {
    setIsSaved(Boolean(video.isSaved));
  }, [video.isSaved]);

  // ===================================================
  // Get Watch Later status
  // ===================================================

  useEffect(() => {
    if (!hasHydrated || !user) {
      return;
    }

    const fetchWatchLaterStatus = async () => {
      try {
        const response =
          await getWatchLaterStatus(video._id);

        setIsSaved(
          Boolean(response?.data?.isSaved),
        );
      } catch (error) {
        console.error(
          "Failed to fetch Watch Later status:",
          error,
        );
      }
    };

    fetchWatchLaterStatus();
  }, [video._id, user, hasHydrated]);

  // ===================================================
  // Guest Authentication Check
  // ===================================================

  const requireLogin = () => {
    if (!hasHydrated) {
      return false;
    }

    if (!user) {
      toast.error("Please login first");
      return false;
    }

    return true;
  };

  // ===================================================
  // Save / Watch Later
  // ===================================================

  const handleSave = async () => {
    if (!requireLogin()) return;

    if (isSaving) return;

    try {
      setIsSaving(true);

      const response =
        await toggleWatchLater(video._id);

      const saved = Boolean(
        response?.data?.isSaved,
      );

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
      setIsSaving(false);
    }
  };

  // ===================================================
  // Download
  // ===================================================

  const handleDownload = async () => {
    if (!requireLogin()) return;

    if (isDownloading) return;

    try {
      setIsDownloading(true);

      const response = await api.get(
        `/downloads/${video._id}`,
      );

      const downloadData =
        response.data?.data;

      const downloadUrl =
        downloadData?.downloadUrl;

      if (!downloadUrl) {
        throw new Error(
          "Download URL not found",
        );
      }

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download =
        downloadData?.fileName ||
        "binge-video.mp4";

      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error: any) {
      console.error(
        "Failed to download video:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to download this video",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // ===================================================
  // Watch Party
  // ===================================================

  const handleCreateWatchParty = async () => {
    if (!requireLogin()) return;

    if (isCreatingParty) return;

    try {
      setIsCreatingParty(true);

      const response =
        await createWatchParty(video._id);

      const party = response?.data;

      const partyCode = party?.partyCode;

      if (!partyCode) {
        throw new Error(
          "Watch Party code not found",
        );
      }

      toast.success(
        "Watch Party created successfully",
      );

      router.push(
        `/watch-party/${partyCode}`,
      );
    } catch (error: any) {
      console.error(
        "Failed to create watch party:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to create Watch Party",
      );
    } finally {
      setIsCreatingParty(false);
    }
  };

  // ===================================================
  // Share
  // ===================================================

  const openShareDialog = () => {
    setShowShareDialog(true);
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      <div className="mt-6 w-full border-b border-border pb-6">
        <div className="flex w-full items-center justify-between gap-4">
          {/* Like */}

          <div className="flex shrink-0 items-center gap-2">
            <LikeButton
              videoId={video._id}
              setLikes={setLikes}
            />

            <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              {formatViews(likes)}
            </span>
          </div>

          {/* Other Actions */}

          <div className="flex shrink-0 items-center gap-2">
            {/* Download */}

            <button
              type="button"
              onClick={handleDownload}
              disabled={
                isDownloading || !hasHydrated
              }
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-3 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              <Download size={18} />

              <span className="hidden sm:inline">
                {isDownloading
                  ? "Downloading..."
                  : "Download"}
              </span>
            </button>

            {/* Watch Party */}

            <button
              type="button"
              onClick={handleCreateWatchParty}
              disabled={
                isCreatingParty || !hasHydrated
              }
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-3 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              <PartyPopper size={18} />

              <span className="hidden sm:inline">
                {isCreatingParty
                  ? "Creating..."
                  : "Watch Party"}
              </span>
            </button>

            {/* Save */}

            <button
              type="button"
              onClick={handleSave}
              disabled={
                isSaving || !hasHydrated
              }
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 ${
                isSaved
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-muted hover:bg-accent"
              }`}
            >
              <Bookmark
                size={18}
                className={
                  isSaved
                    ? "fill-current"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                {isSaving
                  ? "Saving..."
                  : isSaved
                    ? "Saved"
                    : "Save"}
              </span>
            </button>

            {/* More */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted transition hover:bg-accent"
                >
                  <Ellipsis size={19} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-44"
              >
                <DropdownMenuItem
                  onClick={openShareDialog}
                  className="cursor-pointer"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Share Dialog */}

      <ShareDialog
        video={video}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </>
  );
}