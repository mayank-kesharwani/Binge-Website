"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WatchLaterHeader from "@/components/watch-later/WatchLaterHeader";
import WatchLaterGrid from "@/components/watch-later/WatchLaterGrid";
import WatchLaterEmpty from "@/components/watch-later/WatchLaterEmpty";

import { getMyWatchLater } from "@/services/watchLater.service";
import { Video } from "@/types/video";

export default function WatchLaterPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWatchLater = async () => {
      try {
        const response = await getMyWatchLater();

        setVideos(response?.data || []);
      } catch (error: any) {
        console.error(
          "Failed to fetch Watch Later:",
          error,
        );

        toast.error(
          error?.response?.data?.message ||
            "Unable to load Watch Later",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchLater();
  }, []);

  const handleVideoRemoved = (videoId: string) => {
    setVideos((currentVideos) =>
      currentVideos.filter(
        (video) => video._id !== videoId,
      ),
    );
  };

  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WatchLaterHeader />

          {isLoading ? (
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
                      Loading Watch Later...
                    </p>
                  </div>
                </div>
              ) : videos.length === 0 ? (
            <WatchLaterEmpty />
          ) : (
            <WatchLaterGrid
              videos={videos}
              onVideoRemoved={handleVideoRemoved}
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}