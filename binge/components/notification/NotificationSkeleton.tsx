export default function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse gap-4 rounded-2xl border border-border bg-background p-4"
        >
          <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />

          <div className="flex-1">
            <div className="h-4 w-48 rounded bg-muted" />

            <div className="mt-3 h-4 w-full rounded bg-muted" />

            <div className="mt-2 h-4 w-3/4 rounded bg-muted" />

            <div className="mt-3 h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}