export default function CommentsSkeleton() {
  return (
    <section className="mt-8 animate-pulse">
      {/* Heading */}
      <div className="h-7 w-40 rounded bg-muted" />

      {/* Input */}
      <div className="mt-6">
        <div className="h-24 w-full rounded-xl bg-muted" />

        <div className="mt-3 flex justify-end gap-3">
          <div className="h-10 w-24 rounded-full bg-muted" />

          <div className="h-10 w-28 rounded-full bg-muted" />
        </div>
      </div>

      {/* Comments */}
      <div className="mt-8 space-y-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="flex gap-4"
          >
            {/* Avatar */}
            <div className="h-11 w-11 rounded-full bg-muted" />

            {/* Content */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-4 w-28 rounded bg-muted" />

                <div className="h-3 w-20 rounded bg-muted" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted" />

                <div className="h-4 w-5/6 rounded bg-muted" />

                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}