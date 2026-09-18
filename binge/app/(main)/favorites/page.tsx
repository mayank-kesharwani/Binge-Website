"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FavoritesGrid from "@/components/favorites/FavoritesGrid";
import FavoritesHeader from "@/components/favorites/FavoritesHeader";
import FavoritesEmpty from "@/components/favorites/FavoritesEmpty";
import { getLikedVideos } from "@/services/like.service";
import type { Video } from "@/types/video";

export default function FavoritesPage() {
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadLikedVideos = async () => {
      try {
        setLoading(true);

        const response = await getLikedVideos();

        setLikedVideos(response.data ?? []);
      } catch (error) {
        console.error("Failed to load liked videos:", error);

        setLikedVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadLikedVideos();
  }, []);

  const handleFavoritesChange = (videoId: string) => {
    setRemovingId(videoId);

    setLikedVideos((currentVideos) =>
      currentVideos.filter((video) => video._id !== videoId),
    );

    toast.success("Removed from Favorites");

    window.setTimeout(() => {
      setRemovingId((currentId) =>
        currentId === videoId ? null : currentId,
      );
    }, 300);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FavoritesHeader />

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="
                    h-8
                    w-8
                    animate-spin
                    rounded-full
                    border-2
                    border-red-500
                    border-t-transparent
                  "
                />

                <p className="text-sm text-muted-foreground">
                  Loading liked videos...
                </p>
              </div>
            </div>
          ) : likedVideos.length === 0 ? (
            <FavoritesEmpty />
          ) : (
            <div className="relative">
              {removingId && (
                <div
                  className="
                    absolute
                    right-0
                    top-0
                    z-10
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-background/90
                    px-3
                    py-2
                    text-xs
                    text-muted-foreground
                    shadow-sm
                  "
                >
                  <div
                    className="
                      h-3.5
                      w-3.5
                      animate-spin
                      rounded-full
                      border-2
                      border-red-500
                      border-t-transparent
                    "
                  />

                  Updating favorites...
                </div>
              )}

              <FavoritesGrid
                videos={likedVideos}
                onFavoritesChange={handleFavoritesChange}
              />
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}