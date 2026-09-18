"use client";

import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

type ShareDialogVideo = {
  _id: string;
  title: string;
  thumbnailUrl: string;
  isSaved?: boolean;
  isLiked?: boolean;
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ShareDialogProps = {
  video: ShareDialogVideo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SharePlatform =
  | "whatsapp"
  | "telegram"
  | "x"
  | "facebook"
  | "email";

export default function ShareDialog({
  video,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isNativeSharing, setIsNativeSharing] =
    useState(false);

  const getShareUrl = () => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = getShareUrl();

      if (!shareUrl) return;

      await navigator.clipboard.writeText(shareUrl);

      setIsCopied(true);

      toast.success("Video link copied");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy video link:",
        error,
      );

      toast.error("Unable to copy video link");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      setIsNativeSharing(true);

      await navigator.share({
        title: video.title,
        text: `Watch "${video.title}" on Binge`,
        url: getShareUrl(),
      });

      onOpenChange(false);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      toast.error("Unable to share video");
    } finally {
      setIsNativeSharing(false);
    }
  };

  const handlePlatformShare = (
    platform: SharePlatform,
  ) => {
    const shareUrl = getShareUrl();

    if (!shareUrl) return;

    const encodedUrl = encodeURIComponent(shareUrl);

    const encodedTitle = encodeURIComponent(
      `Watch "${video.title}" on Binge`,
    );

    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(
          `Watch "${video.title}" on Binge ${shareUrl}`,
        )}`;
        break;

      case "telegram":
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;

      case "x":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;

      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;

      case "email":
        url = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
          `Watch "${video.title}" on Binge:\n\n${shareUrl}`,
        )}`;
        break;
    }

    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer,width=700,height=600",
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          box-border
          w-[calc(100vw-2rem)]
          max-w-[520px]
          rounded-2xl
          border-border
          bg-background
          p-5
          sm:p-6
        "
      >
        <DialogHeader className="relative pr-10">
          <DialogTitle className="text-2xl font-bold leading-tight text-foreground">
            Share video
          </DialogTitle>

          <DialogDescription className="mb-2 text-sm leading-5 text-muted-foreground sm:text-base">
            Share this video or copy the link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Video preview */}

          <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-28">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover"
              />
            </div>

            <p className="min-w-0 line-clamp-2 text-sm font-semibold leading-5 text-foreground sm:text-base">
              {video.title}
            </p>
          </div>

          {/* Copy link */}

          <button
            type="button"
            onClick={handleCopyLink}
            className="
              flex
              w-full
              min-w-0
              items-center
              justify-between
              rounded-2xl
              border
              border-border
              bg-muted
              px-4
              py-3
              text-left
              transition
              hover:bg-accent
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              {isCopied ? (
                <Check className="h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {isCopied
                    ? "Link copied"
                    : "Copy link"}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {getShareUrl()}
                </p>
              </div>
            </div>

            {isCopied && (
              <span className="ml-3 shrink-0 text-xs font-semibold text-green-500">
                Copied
              </span>
            )}
          </button>

          {/* Native share */}

          {typeof navigator !== "undefined" &&
            "share" in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isNativeSharing}
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-red-500
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Share2 className="h-5 w-5" />

                {isNativeSharing
                  ? "Sharing..."
                  : "Share"}
              </button>
            )}

          {/* Social platforms */}

          <div>
            <p className="mb-2.5 text-base font-semibold text-foreground">
              Share on
            </p>

            <div className="space-y-2">
              {/* WhatsApp */}

              <button
                type="button"
                onClick={() =>
                  handlePlatformShare("whatsapp")
                }
                aria-label="Share on WhatsApp"
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-muted
                  text-foreground
                  transition
                  hover:bg-accent
                  hover:text-green-500
                "
              >
                <MessageCircle className="h-5 w-5 shrink-0" />

                <span className="text-sm font-semibold">
                  WhatsApp
                </span>
              </button>

              {/* Telegram */}

              <button
                type="button"
                onClick={() =>
                  handlePlatformShare("telegram")
                }
                aria-label="Share on Telegram"
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-muted
                  text-foreground
                  transition
                  hover:bg-accent
                  hover:text-sky-500
                "
              >
                <Send className="h-5 w-5 shrink-0" />

                <span className="text-sm font-semibold">
                  Telegram
                </span>
              </button>

              {/* X */}

              <button
                type="button"
                onClick={() =>
                  handlePlatformShare("x")
                }
                aria-label="Share on X"
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-muted
                  text-foreground
                  transition
                  hover:bg-accent
                "
              >
                <span className="text-lg font-bold">
                  X
                </span>

                <span className="text-sm font-semibold">
                  X
                </span>
              </button>

              {/* Facebook */}

              <button
                type="button"
                onClick={() =>
                  handlePlatformShare("facebook")
                }
                aria-label="Share on Facebook"
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-muted
                  text-foreground
                  transition
                  hover:bg-accent
                  hover:text-blue-600
                "
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  f
                </span>

                <span className="text-sm font-semibold">
                  Facebook
                </span>
              </button>

              {/* Email */}

              <button
                type="button"
                onClick={() =>
                  handlePlatformShare("email")
                }
                aria-label="Share through email"
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-muted
                  text-foreground
                  transition
                  hover:bg-accent
                  hover:text-red-500
                "
              >
                <Mail className="h-5 w-5 shrink-0" />

                <span className="text-sm font-semibold">
                  Email
                </span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}