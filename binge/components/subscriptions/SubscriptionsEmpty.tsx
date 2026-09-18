"use client";

import { PlaySquare } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const SubscriptionsEmpty = () => {
  return (
    <div className="flex min-h-[465px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <PlaySquare className="h-9 w-9 text-muted-foregorund" />
      </div>

      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
        No subscriptions yet
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
        Subscribe to your favorite channels to see them here so you can easily
        keep track of their latest videos.
      </p>

      <Link href="/" className="mt-6">
        <Button className="h-10 rounded-full bg-red-500 px-7 text-sm font-semibold text-white hover:bg-red-600">
          Explore Channels
        </Button>
      </Link>
    </div>
  );
};

export default SubscriptionsEmpty;