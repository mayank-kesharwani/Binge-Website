import VideoCardSkeleton from "./VideoCardSkeleton";

export default function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
}