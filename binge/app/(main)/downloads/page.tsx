"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Download,
  Play,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

type DownloadItem = {
  id: string;
  videoId: string;
  title: string;
  videoPublicId: string;
  videoUrl: string;
  thumbnail: string;
  plan: string;
  downloadedAt: string;
  createdAt: string;
};

const formatDownloadDate = (date: string) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function DownloadsPage() {
  const { user, hasHydrated } = useAuthStore();

  const [downloads, setDownloads] = useState<
    DownloadItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    // Guests should not make the protected API request.
    if (!user) {
      setDownloads([]);
      setError("");
      setLoading(false);
      return;
    }

    const fetchDownloads = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/users/downloads");

        setDownloads(
          response.data?.data ?? [],
        );
      } catch (error: any) {
        console.error(
          "Failed to load downloads:",
          error,
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load your downloads",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user, hasHydrated]);

  // ===================================================
  // Auth hydration
  // ===================================================

  if (!hasHydrated) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[465px] max-w-7xl items-center justify-center rounded-2xl border border-border bg-card">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  // ===================================================
  // Guest
  // ===================================================

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Download className="h-5 w-5 text-red-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Downloads
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Videos you have downloaded from Binge
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[465px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Download className="h-9 w-9 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Please login first
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Sign in to view and manage your downloaded videos.
            </p>

            <Link
              href="/login"
              className="mt-6"
            >
              <Button className="h-10 rounded-full bg-red-500 px-7 text-sm font-semibold text-white hover:bg-red-600">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <Download className="h-5 w-5 text-red-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Downloads
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Videos you have downloaded from Binge
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[465px] items-center justify-center rounded-2xl border border-border bg-card">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[465px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Download className="h-9 w-9 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Unable to load downloads
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {error}
            </p>

            <Button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 h-10 rounded-full bg-red-500 px-7 text-sm font-semibold text-white hover:bg-red-600"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          downloads.length === 0 && (
            <div className="flex min-h-[465px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Download className="h-9 w-9 text-muted-foreground" />
              </div>

              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                No downloads yet
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Videos you download will appear here so
                you can easily find them again.
              </p>

              <Link
                href="/"
                className="mt-6"
              >
                <Button className="h-10 rounded-full bg-red-500 px-7 text-sm font-semibold text-white hover:bg-red-600">
                  Explore Videos
                </Button>
              </Link>
            </div>
          )}

        {/* Downloads */}
        {!loading &&
          !error &&
          downloads.length > 0 && (
            <>
              <div className="mb-5">
                <p className="text-sm text-muted-foreground">
                  {downloads.length}{" "}
                  {downloads.length === 1
                    ? "download"
                    : "downloads"}
                </p>
              </div>

              <div className="w-full">
                {downloads.map((download) => (
                  <article
                    key={download.id}
                    className="group relative flex w-full gap-3 border-b border-border py-4 first:pt-0 sm:gap-4 sm:py-5"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/watch/${download.videoId}`}
                      className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-52 md:w-64 lg:w-72"
                    >
                      {download.thumbnail ? (
                        <Image
                          src={download.thumbnail}
                          alt={download.title}
                          fill
                          sizes="(max-width: 640px) 160px, (max-width: 768px) 208px, (max-width: 1024px) 256px, 288px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Download className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                        <div className="flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
                          <Play className="h-4 w-4 fill-current text-foreground" />
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3 sm:gap-5">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/watch/${download.videoId}`}
                        >
                          <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors duration-200 group-hover:text-red-500 sm:text-base">
                            {download.title}
                          </h2>
                        </Link>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                          <span>
                            Downloaded{" "}
                            {formatDownloadDate(
                              download.downloadedAt,
                            )}
                          </span>
                        </div>

                        <div className="mt-2">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                            {download.plan}
                          </span>
                        </div>

                        <Link
                          href={`/watch/${download.videoId}`}
                          className="mt-3 block w-fit"
                        >
                          <Button
                            variant="outline"
                            className="h-9 rounded-full border-border px-4 text-sm text-foreground hover:bg-muted hover:text-red-500"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Watch Video
                          </Button>
                        </Link>
                      </div>

                      {/* Download indicator */}
                      <div className="flex shrink-0 items-center gap-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground">
                          <Download className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
      </div>
    </main>
  );
}