"use client";

import { Clock3 } from "lucide-react";

export default function WatchLaterHeader() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Clock3 className="h-5 w-5 text-red-500" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Watch Later
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Videos you want to watch later
        </p>
      </div>
    </div>
  );
}