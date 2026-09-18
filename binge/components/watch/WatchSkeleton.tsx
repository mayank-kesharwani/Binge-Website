import CommentsSkeleton from "./CommentsSkeleton";

export default function WatchSkeleton() {
  return (
    <main className="mx-auto max-w-[1800px] px-4 py-6">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">

        {/* Left */}
        <section className="min-w-0 animate-pulse">

          {/* Video */}
          <div className="aspect-video rounded-2xl bg-muted" />

          {/* Title */}
          <div className="mt-5 h-8 w-3/4 rounded bg-muted" />

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <div className="h-10 w-24 rounded-full bg-muted" />
            <div className="h-10 w-24 rounded-full bg-muted" />
            <div className="h-10 w-24 rounded-full bg-muted" />
          </div>

          {/* Channel */}
          <div className="mt-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-muted" />

            <div className="flex-1">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="mt-2 h-4 w-28 rounded bg-muted" />
            </div>

            <div className="h-10 w-32 rounded-full bg-muted" />
          </div>

          {/* Description */}
          <div className="mt-6 rounded-2xl bg-muted p-5">
            <div className="h-4 w-full rounded bg-background/50" />
            <div className="mt-3 h-4 w-5/6 rounded bg-background/50" />
            <div className="mt-3 h-4 w-2/3 rounded bg-background/50" />
          </div>

          {/* Comments */}
          <CommentsSkeleton />

        </section>

        {/* Right */}
        <aside className="space-y-4">

          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse gap-3"
            >
              <div className="h-24 w-40 rounded-xl bg-muted" />

              <div className="flex-1">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}

        </aside>

      </div>
    </main>
  );
}