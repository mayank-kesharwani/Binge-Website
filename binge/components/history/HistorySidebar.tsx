"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PauseCircle,
  Trash2,
  Settings,
  Search,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  clearHistory,
  setHistoryPaused,
} from "@/services/history.service";

type Props = {
  paused: boolean;
  setPaused: (value: boolean) => void;

  search: string;
  setSearch: (value: string) => void;

  onHistoryChange: () => void;
};

const HistorySidebar = ({
  paused,
  setPaused,
  search,
  setSearch,
  onHistoryChange,
}: Props) => {
  const [clearing, setClearing] = useState(false);
  const [updatingPause, setUpdatingPause] =
    useState(false);

  const handleClearHistory = async () => {
    try {
      setClearing(true);

      await clearHistory();

      toast.success("Watch history cleared");

      onHistoryChange();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear history");
    } finally {
      setClearing(false);
    }
  };

  const handlePause = async () => {
    const newPaused = !paused;

    try {
      setUpdatingPause(true);

      const response =
        await setHistoryPaused(newPaused);

      const actualPaused =
        response.data?.paused ?? newPaused;

      setPaused(actualPaused);

      toast.success(
        actualPaused
          ? "Watch history paused"
          : "Watch history resumed",
      );
    } catch (error) {
      console.error(
        "Failed to update history settings:",
        error,
      );

      toast.error(
        "Failed to update watch history",
      );
    } finally {
      setUpdatingPause(false);
    }
  };

  return (
    <aside className="min-h-[465px] w-full rounded-2xl border border-border bg-card p-7 shadow-sm lg:sticky lg:top-24 lg:h-fit">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-foreground">
          History
        </h2>

        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Manage your watch history and preferences.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-7">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search watch history"
          className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {/* Pause */}
        <Button
          variant="outline"
          onClick={handlePause}
          disabled={updatingPause}
          className="h-12 w-full justify-start rounded-xl border-border px-4 text-sm font-medium text-foreground hover:bg-muted sm:text-base"
        >
          {paused ? (
            <PlayCircle className="mr-3 h-5 w-5 shrink-0" />
          ) : (
            <PauseCircle className="mr-3 h-5 w-5 shrink-0" />
          )}

          {updatingPause
            ? "Updating..."
            : paused
              ? "Resume History"
              : "Pause History"}
        </Button>

        {/* Clear */}
        <Button
          variant="outline"
          onClick={handleClearHistory}
          disabled={clearing}
          className="h-12 w-full justify-start rounded-xl border-border px-4 text-sm font-medium text-red-500 hover:border-red-500 hover:bg-red-50 sm:text-base"
        >
          <Trash2 className="mr-3 h-5 w-5 shrink-0" />

          {clearing
            ? "Clearing..."
            : "Clear History"}
        </Button>

        {/* Manage */}
        <Link
          href="/settings/privacy"
          className="block w-full"
        >
          <Button
            variant="outline"
            className="h-12 w-full justify-start rounded-xl border-border px-4 text-sm font-medium text-foreground hover:bg-muted sm:text-base"
          >
            <Settings className="mr-3 h-5 w-5 shrink-0" />
            Manage History
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default HistorySidebar;