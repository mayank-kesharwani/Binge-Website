import { VideoOff } from "lucide-react";

export default function EmptyVideos() {
  return (
    <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card">

      <VideoOff className="h-16 w-16 text-muted-foreground" />

      <h2 className="mt-5 text-xl font-semibold">
        No videos found
      </h2>

      <p className="mt-2 text-muted-foreground">
        Videos will appear here once creators upload them.
      </p>

    </div>
  );
}