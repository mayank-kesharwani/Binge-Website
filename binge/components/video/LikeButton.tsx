"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { toggleVideoLike, getVideoLikeStatus } from "@/services/like.service";

import { useAuthStore } from "@/store/authStore";

type LikeButtonProps = {
  videoId: string;
  setLikes: React.Dispatch<React.SetStateAction<number>>;
};

export default function LikeButton({ videoId, setLikes }: LikeButtonProps) {
  const { user, hasHydrated } = useAuthStore();

  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    // Guest users don't have a like status to fetch.
    if (!user) {
      setLiked(false);
      setChecking(false);
      return;
    }

    let mounted = true;

    const fetchStatus = async () => {
      try {
        setChecking(true);

        const response = await getVideoLikeStatus(videoId);

        if (mounted) {
          setLiked(Boolean(response.data?.liked));
        }
      } catch (error) {
        console.error("Failed to fetch like status:", error);
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    fetchStatus();

    return () => {
      mounted = false;
    };
  }, [videoId, user, hasHydrated]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (loading || checking) return;

    try {
      setLoading(true);

      const response = await toggleVideoLike(videoId);

      const isLiked = Boolean(response.data?.liked);

      const likes = Number(response.data?.likes ?? 0);

      setLiked(isLiked);
      setLikes(likes);
    } catch (error) {
      console.error("Failed to toggle video like:", error);
    } finally {
      setLoading(false);
    }
  };

  const toastLogin = async () => {
    const { toast } = await import("sonner");

    toast.error("Please login first");
  };

  return (
    <Button
      onClick={handleLike}
      disabled={loading || (checking && Boolean(user))}
      className={`h-10 rounded-full px-4 text-sm font-medium transition-all duration-300 ${
        liked
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-muted text-foreground hover:bg-accent"
      }`}
    >
      {loading || checking ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ThumbsUp className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
      )}

      {liked ? "Liked" : "Like"}
    </Button>
  );
}
