"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  LayoutDashboard,
  Palette,
  ShieldAlert,
} from "lucide-react";

const CreatorToolbar = () => {
  return (
    <section className="mt-8">
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
          rounded-2xl
          border
          border-border
          bg-card
          p-4
          text-card-foreground
          shadow-sm
        "
      >
        {/* Upload Video */}
        <Link href="/upload">
          <Button
            className="
              rounded-full
              bg-red-500
              text-white
              hover:bg-red-600
            "
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </Link>

        {/* Manage Videos */}
        <Link href="/manage">
          <Button
            variant="outline"
            className="
              rounded-full
              border-border
              bg-background
              text-foreground

              hover:border-red-500
              hover:bg-red-50
              hover:text-red-500

              dark:hover:bg-red-950/30
              dark:hover:text-red-400
            "
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Manage Videos
          </Button>
        </Link>

        {/* Customize Channel */}
        <Link href="/creator/customize">
          <Button
            variant="outline"
            className="
              rounded-full
              border-border
              bg-background
              text-foreground

              hover:border-red-500
              hover:bg-red-50
              hover:text-red-500

              dark:hover:bg-red-950/30
              dark:hover:text-red-400
            "
          >
            <Palette className="mr-2 h-4 w-4" />
            Customize Channel
          </Button>
        </Link>

        {/* Moderation */}
        <Link href="/moderation">
          <Button
            variant="outline"
            className="
              rounded-full
              border-border
              bg-background
              text-foreground

              hover:border-red-500
              hover:bg-red-50
              hover:text-red-500

              dark:hover:bg-red-950/30
              dark:hover:text-red-400
            "
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Moderation
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CreatorToolbar;