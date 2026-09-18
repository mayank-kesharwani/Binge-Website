import VideoCard from "@/components/video/VideoCard";
import EmptyChannel from "./EmptyChannel";

import { Video } from "@/types/video";

type Props = {
  videos: Video[];
};

export default function ChannelVideoGrid({
  videos,
}: Props) {
  if (videos.length === 0) {
    return <EmptyChannel />;
  }

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
          />
        ))}
      </div>
    </section>
  );
}