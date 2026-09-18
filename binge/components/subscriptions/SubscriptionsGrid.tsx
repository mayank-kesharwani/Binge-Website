"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MoreVertical, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleSubscription } from "@/services/subscription.service";

type SubscriptionChannel = {
  _id: string;
  channelName: string;
  handle: string;
  avatar: string;
  banner?: string;
  subscribers: number;
  isVerified: boolean;
  description?: string;
};

interface SubscriptionsGridProps {
  channels: SubscriptionChannel[];
  onSubscriptionChange: (channelId: string) => void;
}

const formatSubscribers = (count: number) => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(
      count >= 10_000_000 ? 0 : 1,
    )}M`;
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(count >= 10_000 ? 0 : 1)}K`;
  }

  return count.toLocaleString();
};

const SubscriptionsGrid = ({
  channels,
  onSubscriptionChange,
}: SubscriptionsGridProps) => {
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);

  const handleUnsubscribe = async (channelId: string) => {
    if (unsubscribingId) return;

    try {
      setUnsubscribingId(channelId);

      await toggleSubscription(channelId);

      onSubscriptionChange(channelId);

      toast.success("Unsubscribed successfully");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to unsubscribe");
    } finally {
      setUnsubscribingId(null);
    }
  };

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {channels.map((channel) => {
        const isUnsubscribing = unsubscribingId === channel._id;

        return (
          <article
            key={channel._id}
            className="group relative flex w-full items-center gap-3 border-b border-border py-4 first:pt-0 sm:gap-4 sm:py-5"
          >
            <Link
              href={`/channel/${channel._id}`}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted sm:h-20 sm:w-20 md:h-24 md:w-24"
            >
              {channel.avatar ? (
                <Image
                  src={channel.avatar}
                  alt={channel.channelName}
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserCircle2 className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                </div>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:gap-5">
              <Link
                href={`/channel/${channel._id}`}
                className="min-w-0 flex-1"
              >
                <div className="flex items-center gap-1.5">
                  <h2 className="truncate text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-red-500 sm:text-base">
                    {channel.channelName}
                  </h2>

                  {channel.isVerified && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 fill-red-500 text-background sm:h-4 sm:w-4" />
                  )}
                </div>

                {channel.handle && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                    @{channel.handle}
                  </p>
                )}

                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {formatSubscribers(channel.subscribers)} subscribers
                </p>

                {channel.description && (
                  <p className="mt-1 hidden max-w-2xl truncate text-xs text-muted-foreground md:block">
                    {channel.description}
                  </p>
                )}
              </Link>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUnsubscribing}
                  onClick={() => handleUnsubscribe(channel._id)}
                  className="h-9 rounded-full border-border px-3 text-xs font-medium text-foreground hover:bg-muted hover:text-red-500 sm:px-4 sm:text-sm"
                >
                  {isUnsubscribing ? (
                    <>
                      <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      <span className="hidden sm:inline">
                        Unsubscribing...
                      </span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    "Subscribed"
                  )}
                </Button>

                <button
                  type="button"
                  aria-label={`More options for ${channel.channelName}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default SubscriptionsGrid;