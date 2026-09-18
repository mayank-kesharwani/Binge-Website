"use client";

import { History } from "lucide-react";
import Link from "next/link";

import HistoryVideoCard from "./HistoryVideoCard";

import { Button } from "@/components/ui/button";

type Props = {
  history: any[];
  search: string;
  onHistoryChange: () => void;
};

const HistorySection = ({
  history,
  search,
  onHistoryChange,
}: Props) => {
  // -----------------------------
  // Search
  // -----------------------------

  const searchText = search.trim().toLowerCase();

  const filteredHistory = history.filter((item) => {
    const video = item.video;

    if (!video) return false;

    if (!searchText) return true;

    const title =
      video.title?.toLowerCase() || "";

    const channel =
      video.channel?.channelName?.toLowerCase() || "";

    return (
      title.includes(searchText) ||
      channel.includes(searchText)
    );
  });

  // -----------------------------
  // Group by date
  // -----------------------------

  const groupedHistory = filteredHistory.reduce(
    (
      groups: Record<string, any[]>,
      item,
    ) => {
      const date = new Date(item.watchedAt);

      const today = new Date();

      const yesterday = new Date();
      yesterday.setDate(
        today.getDate() - 1,
      );

      let title =
        date.toLocaleDateString();

      if (
        date.toDateString() ===
        today.toDateString()
      ) {
        title = "Today";
      } else if (
        date.toDateString() ===
        yesterday.toDateString()
      ) {
        title = "Yesterday";
      }

      if (!groups[title]) {
        groups[title] = [];
      }

      groups[title].push(item);

      return groups;
    },
    {},
  );

  // -----------------------------
  // No history / search results
  // -----------------------------

  if (filteredHistory.length === 0) {
    return (
      <div className="flex min-h-[465px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 text-center shadow-sm">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <History className="h-9 w-9 text-muted-foreground" />
        </div>

        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {searchText
            ? "No matching videos"
            : "No watch history"}
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          {searchText
            ? "Try searching for another video or channel."
            : "Videos you watch will appear here."}
        </p>

        {!searchText && (
          <Link href="/" className="mt-6">
            <Button className="h-10 rounded-full bg-red-500 px-7 text-sm font-semibold text-white hover:bg-red-600">
              Explore Videos
            </Button>
          </Link>
        )}
      </div>
    );
  }

  // -----------------------------
  // History
  // -----------------------------

  return (
    <div className="space-y-10">
      {Object.entries(groupedHistory).map(
        ([title, items]) => (
          <section key={title}>
            <h2 className="mb-5 text-2xl font-bold text-foreground">
              {title}
            </h2>

            <div className="space-y-5">
              {items.map((item) => (
                <HistoryVideoCard
                  key={item._id}
                  item={item}
                  onHistoryChange={
                    onHistoryChange
                  }
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
};

export default HistorySection;