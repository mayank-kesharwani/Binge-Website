"use client";

import { useEffect, useState } from "react";
import {
  Check,
  EyeOff,
  Flag,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  getReportedComments,
  moderateReportedComment,
  type ModerationAction,
} from "@/services/comment.service";

type Report = {
  _id: string;
  reason: string;
  details?: string;
  status: string;

  reporter?: {
    name?: string;
    username?: string;
    avatar?: string;
  };

  comment?: {
    _id: string;
    text: string;

    user?: {
      name?: string;
      username?: string;
      avatar?: string;
    };

    video?: {
      _id?: string;
      title?: string;

      channel?: {
        channelName?: string;
      };
    };
  };
};

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState<string | null>(null);

  // =====================================================
  // Fetch reports
  // =====================================================

  const loadReports = async () => {
    try {
      setLoading(true);

      const response =
        await getReportedComments();

      setReports(response.data || []);
    } catch (error: any) {
      console.error(
        "GET REPORTS ERROR:",
        error?.response?.data || error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load reported comments",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // =====================================================
  // Moderate
  // =====================================================

  const handleModeration = async (
    commentId: string,
    action: ModerationAction,
  ) => {
    try {
      setProcessing(commentId);

      const response =
        await moderateReportedComment(
          commentId,
          action,
        );

      toast.success(
        response.message ||
          getSuccessMessage(action),
      );

      // Remove processed comment from queue
      setReports((current) =>
        current.filter(
          (report) =>
            report.comment?._id !== commentId,
        ),
      );
    } catch (error: any) {
      console.error(
        "MODERATION ERROR:",
        error?.response?.data || error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to moderate comment",
      );
    } finally {
      setProcessing(null);
    }
  };

  const getSuccessMessage = (
    action: ModerationAction,
  ) => {
    switch (action) {
      case "approve":
        return "Comment approved";

      case "remove":
        return "Comment removed";

      case "dismiss":
        return "Report dismissed";
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Loading moderation queue...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      {/* Header */}

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-2 text-red-600">
            <Flag size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Comment Moderation
            </h1>

            <p className="text-sm text-muted-foreground">
              Review comments reported on your
              videos.
            </p>
          </div>
        </div>
      </div>

      {/* Report count */}

      {reports.length > 0 && (
        <div className="mb-5 text-sm text-muted-foreground">
          {reports.length}{" "}
          {reports.length === 1
            ? "report"
            : "reports"}{" "}
          waiting for review
        </div>
      )}

      {/* Empty state */}

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Check
              size={28}
              className="text-green-600"
            />
          </div>

          <h2 className="text-lg font-semibold text-foreground">
            All clear
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            There are no reported comments waiting
            for review.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reports.map((report) => {
            const comment = report.comment;

            if (!comment) {
              return null;
            }

            const isProcessing =
              processing === comment._id;

            return (
              <div
                key={report._id}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                {/* Report header */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium capitalize text-red-700">
                        {report.reason}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        Pending review
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      Reported by{" "}
                      <span className="font-medium text-foreground">
                        {report.reporter?.name ||
                          report.reporter?.username ||
                          "User"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Comment */}

                <div className="mt-5 rounded-xl bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    {comment.user?.avatar && (
                      <img
                        src={comment.user.avatar}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {comment.user?.name ||
                          comment.user?.username ||
                          "User"}
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video */}

                <div className="mt-4 rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Reported on video
                  </p>

                  <p className="mt-1 text-sm font-medium text-foreground">
                    {comment.video?.title ||
                      "Unknown video"}
                  </p>

                  {comment.video?.channel
                    ?.channelName && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {comment.video.channel.channelName}
                    </p>
                  )}
                </div>

                {/* Details */}

                {report.details && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Reporter's details
                    </p>

                    <p className="mt-1 text-sm text-foreground">
                      {report.details}
                    </p>
                  </div>
                )}

                {/* Actions */}

                <div className="mt-5 flex flex-wrap gap-2">
                  {/* Approve */}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleModeration(
                        comment._id,
                        "approve",
                      )
                    }
                    className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={16} />

                    {isProcessing
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  {/* Remove */}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleModeration(
                        comment._id,
                        "remove",
                      )
                    }
                    className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <EyeOff size={16} />
                    Remove
                  </button>

                  {/* Dismiss */}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleModeration(
                        comment._id,
                        "dismiss",
                      )
                    }
                    className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={16} />
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}