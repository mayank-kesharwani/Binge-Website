export default function VideoCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl p-2">

      {/* Thumbnail */}
      <div className="aspect-video w-full rounded-2xl bg-muted" />

      {/* Details */}
      <div className="mt-4 flex gap-3">

        {/* Avatar */}
        <div className="h-11 w-11 rounded-full bg-muted" />

        {/* Text */}
        <div className="flex-1">

          <div className="h-4 w-full rounded bg-muted" />

          <div className="mt-2 h-4 w-3/4 rounded bg-muted" />

          <div className="mt-3 h-3 w-1/2 rounded bg-muted" />

        </div>
      </div>

    </div>
  );
}