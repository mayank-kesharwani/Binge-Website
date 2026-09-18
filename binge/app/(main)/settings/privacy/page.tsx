"use client";

import Link from "next/link";
import {
  ArrowLeft,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Switch } from "@/components/ui/switch";
import {
  getHistorySettings,
  setHistoryPaused,
} from "@/services/history.service";

export default function PrivacyPage() {
  const [historyPaused, setHistoryPausedState] =
    useState(false);
  const [updatingHistory, setUpdatingHistory] =
    useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        const response = await getHistorySettings();

        setHistoryPausedState(
          response.data?.paused ?? false,
        );
      } catch (error) {
        console.error(
          "Failed to load privacy settings:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrivacySettings();
  }, []);

  const handleHistoryPause = async (
    paused: boolean,
  ) => {
    try {
      setUpdatingHistory(true);

      const response =
        await setHistoryPaused(paused);

      const actualPaused =
        response.data?.paused ?? paused;

      setHistoryPausedState(actualPaused);

      toast.success(
        actualPaused
          ? "Watch history paused"
          : "Watch history resumed",
      );
    } catch (error) {
      console.error(
        "Failed to update watch history:",
        error,
      );

      toast.error(
        "Failed to update watch history",
      );
    } finally {
      setUpdatingHistory(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Back */}
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            Privacy
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Privacy & Data
          </h1>

          <p className="mt-3 text-muted-foreground">
            Control how your data is stored and used
            across Binge.
          </p>
        </div>

        <div className="space-y-5">
          {/* Watch History */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                {historyPaused ? (
                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <PauseCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Save Watch History
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Remember videos you&apos;ve watched
                  so you can view your history and
                  continue watching later.
                </p>
              </div>
            </div>

            <Switch
              checked={!historyPaused}
              disabled={
                loading || updatingHistory
              }
              onCheckedChange={(checked) =>
                handleHistoryPause(!checked)
              }
              className="shrink-0 self-end sm:self-center"
            />
          </div>

          {/* Privacy Policy */}
          <Link
            href="/settings/privacy-policy"
            className="block"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-red-500/50 hover:bg-muted">
              <h2 className="text-base font-semibold text-foreground">
                Privacy Policy
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Learn how Binge collects, uses, stores,
                and protects your information.
              </p>
            </div>
          </Link>

          {/* Terms & Conditions */}
          <Link
            href="/settings/terms"
            className="block"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-red-500/50 hover:bg-muted">
              <h2 className="text-base font-semibold text-foreground">
                Terms & Conditions
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Read the terms and conditions that
                apply when using Binge.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}