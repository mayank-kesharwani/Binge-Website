import { getAllVideos } from "@/services/video.service";
import { Video } from "@/types/video";

import SuggestedVideoCard from "./SuggestedVideoCard";

type Props = {
  currentVideoId: string;
};

export default async function SuggestedVideos({
  currentVideoId,
}: Props) {
  const response = await getAllVideos();

  const videos: Video[] = response.data;

  const suggested = videos.filter(
    (video) => video._id !== currentVideoId
  );

  return (
    <div className="space-y-3">
      <h2 className="mb-2 text-lg font-bold text-foreground">
        Suggested Videos
      </h2>

      {suggested.map((video) => (
        <SuggestedVideoCard
          key={video._id}
          video={video}
        />
      ))}
    </div>
  );
}