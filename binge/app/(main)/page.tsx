import CategoryTabs from "@/components/channel/CategoryTabs";
import VideoGrid from "@/components/video/VideoGrid";

import { getAllVideos } from "@/services/video.service";

type HomeProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function Home({
  searchParams,
}: HomeProps) {
  const response = await getAllVideos();

  const videos = response.data ?? response;

  const params = await searchParams;

  const selectedCategory =
    params.category?.trim() || "All";

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter(
          (video: {
            category?: string;
          }) =>
            video.category?.toLowerCase() ===
            selectedCategory.toLowerCase(),
        );

  return (
    <div className="min-h-screen bg-background">
      <CategoryTabs />

      <main className="p-4 md:p-6">
        {filteredVideos.length > 0 ? (
          <VideoGrid videos={filteredVideos} />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <h2 className="text-xl font-semibold text-foreground">
              No videos found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              There are no videos in the{" "}
              <span className="font-medium text-red-500">
                {selectedCategory}
              </span>{" "}
              category yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}