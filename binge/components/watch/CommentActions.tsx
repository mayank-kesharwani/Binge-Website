"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Pencil,
  Trash2,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Languages,
} from "lucide-react";

import { toast } from "sonner";

import {
  updateComment,
  deleteComment,
  reactToComment,
  reportComment,
  translateComment,
} from "@/services/comment.service";

import { useAuthStore } from "@/store/authStore";

// =====================================================
// Types
// =====================================================

type ReportReason =
  | "abuse"
  | "spam"
  | "hate"
  | "harassment"
  | "sexual"
  | "violence"
  | "other";

type CommentActionsProps = {
  commentId: string;
  initialText: string;

  initialLikes?: number;
  initialDislikes?: number;

  initialUserReaction?: "like" | "dislike" | null;

  language?: string;
  targetLanguage?: "en" | "hi";

  isOwner: boolean;

  onCommentChange?: () => void;
};

// =====================================================
// Report Options
// =====================================================

const reportReasons: {
  value: ReportReason;
  label: string;
}[] = [
  {
    value: "abuse",
    label: "Abusive content",
  },
  {
    value: "spam",
    label: "Spam",
  },
  {
    value: "hate",
    label: "Hate speech",
  },
  {
    value: "harassment",
    label: "Harassment",
  },
  {
    value: "sexual",
    label: "Sexual content",
  },
  {
    value: "violence",
    label: "Violence",
  },
  {
    value: "other",
    label: "Other",
  },
];

// =====================================================
// Component
// =====================================================

export default function CommentActions({
  commentId,
  initialText,
  initialLikes = 0,
  initialDislikes = 0,
  initialUserReaction = null,
  language = "en",
  targetLanguage,
  isOwner,
  onCommentChange,
}: CommentActionsProps) {
  const router = useRouter();

  const { user, hasHydrated } = useAuthStore();

  // ===================================================
  // Edit
  // ===================================================

  const [editing, setEditing] = useState(false);

  const [text, setText] = useState(initialText);

  const [loading, setLoading] = useState(false);

  // ===================================================
  // Reactions
  // ===================================================

  const [likes, setLikes] = useState(initialLikes);

  const [dislikes, setDislikes] =
    useState(initialDislikes);

  const [userReaction, setUserReaction] =
    useState<"like" | "dislike" | null>(
      initialUserReaction,
    );

  // ===================================================
  // Translation
  // ===================================================

  const [translatedText, setTranslatedText] =
    useState<string | null>(null);

  const [translatedLanguage, setTranslatedLanguage] =
    useState<"en" | "hi" | null>(null);

  const [translating, setTranslating] =
    useState(false);

  // ===================================================
  // Report
  // ===================================================

  const [showReport, setShowReport] =
    useState(false);

  const [reporting, setReporting] =
    useState(false);

  // ===================================================
  // Authentication
  // ===================================================

  const requireLogin = () => {
    if (!hasHydrated) {
      return false;
    }

    if (!user) {
      toast.error("Please login first");
      return false;
    }

    return true;
  };

  // ===================================================
  // Update Comment
  // ===================================================

  const handleUpdate = async () => {
    if (!user || !isOwner) {
      toast.error("Please login first");
      return;
    }

    const cleanText = text.trim();

    if (!cleanText) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (cleanText.length > 1000) {
      toast.error(
        "Comment cannot exceed 1000 characters",
      );
      return;
    }

    try {
      setLoading(true);

      await updateComment(commentId, cleanText);

      toast.success("Comment updated");

      setEditing(false);

      onCommentChange?.();

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // Delete Comment
  // ===================================================

  const handleDelete = async () => {
    if (!user || !isOwner) {
      toast.error("Please login first");
      return;
    }

    if (!confirm("Delete this comment?")) {
      return;
    }

    try {
      setLoading(true);

      await deleteComment(commentId);

      toast.success("Comment deleted");

      onCommentChange?.();

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // Like / Dislike
  // ===================================================

  const handleReaction = async (
    type: "like" | "dislike",
  ) => {
    if (!requireLogin()) return;

    try {
      const response = await reactToComment(
        commentId,
        type,
      );

      const data = response.data;

      setLikes(data.likes ?? 0);

      setDislikes(data.dislikes ?? 0);

      setUserReaction(
        data.reaction ?? null,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to update reaction",
      );
    }
  };

  // ===================================================
  // Translation
  // ===================================================

  const handleTranslate = async () => {
    if (!requireLogin()) return;

    try {
      setTranslating(true);

      /*
       * Detect the actual language of the comment.
       *
       * Devanagari characters → Hindi
       * Otherwise → English
       */
      const detectedSourceLanguage: "en" | "hi" =
        /[\u0900-\u097F]/.test(initialText)
          ? "hi"
          : "en";

      /*
       * If a target language was supplied but it is
       * the same as the detected language, use the
       * other supported language.
       */
      let translationTarget: "en" | "hi";

      if (
        targetLanguage &&
        targetLanguage !==
          detectedSourceLanguage
      ) {
        translationTarget = targetLanguage;
      } else {
        translationTarget =
          detectedSourceLanguage === "hi"
            ? "en"
            : "hi";
      }

      const response =
        await translateComment(
          commentId,
          translationTarget,
        );

      const data =
        response.data?.data ||
        response.data;

      setTranslatedText(
        data.translatedText,
      );

      setTranslatedLanguage(
        translationTarget,
      );
    } catch (error) {
      console.error(error);

      toast.error("Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  // ===================================================
  // Report
  // ===================================================

  const handleReport = async (
    reason: ReportReason,
  ) => {
    if (!requireLogin()) return;

    try {
      setReporting(true);

      await reportComment(commentId, {
        reason,
      });

      toast.success(
        "Comment reported for review",
      );

      setShowReport(false);
    } catch (error: any) {
      console.error(
        "REPORT ERROR:",
        error?.response?.data || error,
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to report comment";

      toast.error(message);
    } finally {
      setReporting(false);
    }
  };

  // ===================================================
  // Edit Mode
  // ===================================================

  if (editing) {
    return (
      <div className="mt-3">
        <textarea
          value={text}
          disabled={loading}
          maxLength={1000}
          onChange={(e) =>
            setText(e.target.value)
          }
          className="w-full resize-none rounded-xl border border-border bg-background p-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        />

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={
              loading || !text.trim()
            }
            className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={16} />

            {loading
              ? "Saving..."
              : "Save"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setText(initialText);
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
          >
            <X size={16} />

            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // Normal Mode
  // ===================================================

  return (
    <div className="mt-3">
      {/* ============================================= */}
      {/* Actions */}
      {/* ============================================= */}

      <div className="flex flex-wrap items-center gap-4">
        {/* Like */}

        <button
          type="button"
          onClick={() =>
            handleReaction("like")
          }
          className={`flex items-center gap-1 text-sm transition ${
            userReaction === "like"
              ? "text-red-600"
              : "text-muted-foreground hover:text-red-600"
          }`}
          aria-label="Like comment"
        >
          <ThumbsUp
            size={16}
            className={
              userReaction === "like"
                ? "fill-current"
                : ""
            }
          />

          {likes}
        </button>

        {/* Dislike */}

        <button
          type="button"
          onClick={() =>
            handleReaction("dislike")
          }
          className={`flex items-center gap-1 text-sm transition ${
            userReaction === "dislike"
              ? "text-red-600"
              : "text-muted-foreground hover:text-red-600"
          }`}
          aria-label="Dislike comment"
        >
          <ThumbsDown
            size={16}
            className={
              userReaction === "dislike"
                ? "fill-current"
                : ""
            }
          />

          {dislikes}
        </button>

        {/* Translate */}

        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating}
          className="flex items-center gap-1 text-sm text-muted-foreground transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Languages size={16} />

          {translating
            ? "Translating..."
            : "Translate"}
        </button>

        {/* Report */}

        <button
          type="button"
          onClick={() => {
            if (!requireLogin()) return;

            setShowReport(!showReport);
          }}
          className={`flex items-center gap-1 text-sm transition ${
            showReport
              ? "text-red-600"
              : "text-muted-foreground hover:text-red-600"
          }`}
        >
          <Flag size={16} />

          Report
        </button>

        {/* Edit */}

        {isOwner && (
          <button
            type="button"
            onClick={() => {
              if (!requireLogin()) return;

              setEditing(true);
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground transition hover:text-red-600"
          >
            <Pencil size={16} />

            Edit
          </button>
        )}

        {/* Delete */}

        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1 text-sm text-muted-foreground transition hover:text-red-600"
          >
            <Trash2 size={16} />

            Delete
          </button>
        )}
      </div>

      {/* ============================================= */}
      {/* Translation */}
      {/* ============================================= */}

      {translatedText && (
        <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Translated
              </span>

              {translatedLanguage && (
                <span className="ml-2 text-xs text-muted-foreground">
                  •{" "}
                  {translatedLanguage ===
                  "hi"
                    ? "Hindi"
                    : "English"}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setTranslatedText(null)
              }
              className="text-xs text-muted-foreground transition hover:text-foreground"
            >
              Hide
            </button>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
            {translatedText}
          </p>
        </div>
      )}

      {/* ============================================= */}
      {/* Report Menu */}
      {/* ============================================= */}

      {showReport && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (!reporting) {
              setShowReport(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Report comment
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Why are you reporting this
                  comment?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowReport(false)
                }
                disabled={reporting}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {reportReasons.map(
                ({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={reporting}
                    onClick={() =>
                      handleReport(value)
                    }
                    className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reporting
                      ? "Reporting..."
                      : label}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setShowReport(false)
              }
              disabled={reporting}
              className="mt-4 w-full rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}