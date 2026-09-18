import EmptyVideos from "@/components/video/EmptyVideos";
import VideoCard from "@/components/video/VideoCard";

type Video = {
  _id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  createdAt: string;

  channel: {
    channelName: string;
    handle: string;
    avatar: string;
    isVerified: boolean;
  };
};

type VideoGridProps = {
  videos: Video[];
};

export default function VideoGrid({
  videos,
}: VideoGridProps) {
  if (!videos.length) {
    return <EmptyVideos />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
        />
      ))}
    </div>
  );
}