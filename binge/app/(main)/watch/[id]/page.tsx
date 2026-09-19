import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import api from "@/lib/axios";
import { getAllVideos } from "@/services/video.service";

import VideoPlayer from "@/components/watch/VideoPlayer";
import VideoInfo from "@/components/watch/VideoInfo";
import VideoActions from "@/components/watch/VideoActions";
import ChannelInfo from "@/components/watch/ChannelInfo";
import VideoDescription from "@/components/watch/VideoDescription";
import Comments from "@/components/watch/Comments";
import SuggestedVideos from "@/components/watch/SuggestedVideos";

type WatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WatchPage({
  params,
}: WatchPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  // =====================================================
  // Video
  // =====================================================

  let response;

  try {
    response = await api.get(`/videos/${id}`, {
      headers: authHeaders,
    });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      notFound();
    }

    throw error;
  }

  const video = response.data?.data;

  if (!video) {
    notFound();
  }

  // =====================================================
  // Suggested / Next Videos
  // =====================================================

  const videosResponse = await getAllVideos();
  const videos = videosResponse.data;

  const currentIndex = videos.findIndex(
    (item: any) => item._id === video._id,
  );

  const nextVideo = videos[currentIndex + 1];

  // =====================================================
  // Membership / Ad Visibility
  // =====================================================

  let adFree = false;

  
  if (token) {
    try {
      const membershipResponse =
        await api.get("/membership/me", {
          headers: authHeaders,
        });

      adFree =
        membershipResponse.data?.data?.adFree ??
        false;
    } catch (error) {
      
      console.error(
        "Failed to fetch membership ad status:",
        error,
      );

      adFree = false;
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="mx-auto max-w-[1800px] px-4 py-6">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0">
          <VideoPlayer
            video={video}
            nextVideoId={nextVideo?._id}
          />

          {/* Advertisement */}

          {!adFree && (
            <div className="my-6 flex min-h-[120px] items-center justify-center rounded-2xl border border-border bg-card">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Advertisement
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your ad will appear here
                </p>
              </div>
            </div>
          )}

          <VideoInfo video={video} />

          <VideoActions video={video} />

          <ChannelInfo video={video} />

          <VideoDescription video={video} />

          <Comments videoId={video._id} />
        </section>

        <aside className="h-fit xl:sticky xl:top-24">
          <SuggestedVideos
            currentVideoId={video._id}
          />
        </aside>
      </div>
    </main>
  );
}