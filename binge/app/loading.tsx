import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <Loader2 className="h-9 w-9 animate-spin text-red-500" />
        </div>

        <p className="text-lg font-semibold text-foreground">
          Loading Binge...
        </p>
      </div>
    </div>
  );
}