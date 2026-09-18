"use client";

import { useState } from "react";
import { Copy, PartyPopper, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createWatchParty,
  type WatchParty,
} from "@/services/watchParty.service";

interface CreateWatchPartyProps {
  videoId: string;
}

const CreateWatchParty = ({
  videoId,
}: CreateWatchPartyProps) => {
  const [loading, setLoading] = useState(false);
  const [party, setParty] = useState<WatchParty | null>(null);

  const handleCreateParty = async () => {
    try {
      setLoading(true);

      const response = await createWatchParty(videoId);
      const createdParty = response.data as WatchParty;

      setParty(createdParty);

      toast.success("Watch Party created successfully");
    } catch (error: any) {
      console.error(
        "Failed to create watch party:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to create Watch Party",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPartyUrl = () => {
    if (!party) return "";

    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/watch-party/${party.partyCode}`;
  };

  const handleCopyInvite = async () => {
    const partyUrl = getPartyUrl();

    if (!partyUrl) return;

    try {
      await navigator.clipboard.writeText(partyUrl);

      toast.success("Watch Party invite copied");
    } catch (error) {
      console.error(
        "Failed to copy invite:",
        error,
      );

      toast.error("Failed to copy invite");
    }
  };

  const handleShare = async () => {
    const partyUrl = getPartyUrl();

    if (!partyUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Binge Watch Party",
          text: "Join me for a Watch Party on Binge!",
          url: partyUrl,
        });
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          toast.error("Unable to share Watch Party");
        }
      }

      return;
    }

    await handleCopyInvite();
  };

  if (party) {
    return (
      <div className="w-full rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <PartyPopper className="h-5 w-5 text-red-500" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">
              Watch Party Ready
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Share the invite with your friends to watch together.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-muted px-3 py-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {getPartyUrl()}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyInvite}
                className="h-10 w-10 shrink-0 rounded-full border-border"
                title="Copy invite"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                onClick={handleShare}
                className="h-10 w-10 shrink-0 rounded-full bg-red-500 text-white hover:bg-red-600"
                title="Share invite"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={() =>
                window.location.assign(
                  `/watch-party/${party.partyCode}`,
                )
              }
              className="mt-3 rounded-full bg-red-500 px-5 text-white hover:bg-red-600"
            >
              Enter Watch Party
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleCreateParty}
      disabled={loading}
      className="rounded-full bg-red-500 px-5 text-white hover:bg-red-600"
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Creating...
        </>
      ) : (
        <>
          <PartyPopper className="mr-2 h-4 w-4" />
          Watch Party
        </>
      )}
    </Button>
  );
};

export default CreateWatchParty;