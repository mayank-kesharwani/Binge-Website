"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HistorySection from "@/components/history/HistorySection";
import HistorySidebar from "@/components/history/HistorySidebar";
import {
  getHistory,
  getHistorySettings,
} from "@/services/history.service";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const response = await getHistory();

      setHistory(response.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch history:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);

        const [
          historyResponse,
          settingsResponse,
        ] = await Promise.all([
          getHistory(),
          getHistorySettings(),
        ]);

        setHistory(historyResponse.data || []);

        setPaused(
          settingsResponse.data?.paused ?? false,
        );
      } catch (error) {
        console.error(
          "Failed to load history:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleHistoryChange = () => {
    fetchHistory();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <History className="h-5 w-5 text-red-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Watch History
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Videos you&apos;ve watched recently
              </p>
            </div>
          </div>

          {/* Sidebar + History */}
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-10">
            {/* Sidebar */}
            <aside className="order-1 lg:sticky lg:top-24 lg:h-fit">
              <HistorySidebar
                paused={paused}
                setPaused={setPaused}
                search={search}
                setSearch={setSearch}
                onHistoryChange={
                  handleHistoryChange
                }
              />
            </aside>

            {/* Main */}
            <main className="order-2 min-w-0">
              {loading ? (
                <div className="flex min-h-[465px] items-center justify-center rounded-2xl border border-border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Loading history...
                  </p>
                </div>
              ) : (
                <HistorySection
                  history={history}
                  search={search}
                  onHistoryChange={
                    handleHistoryChange
                  }
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}