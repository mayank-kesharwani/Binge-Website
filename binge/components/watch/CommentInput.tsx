"use client";

import { useState } from "react";
import { addComment } from "@/services/comment.service";

type CommentInputProps = {
  videoId: string;
  onCommentAdded: () => void;
};

export default function CommentInput({
  videoId,
  onCommentAdded,
}: CommentInputProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxLength = 1000;

  const handleSubmit = async () => {
    const text = comment.trim();

    if (!text) return;

    if (text.length > maxLength) {
      setError(`Comment cannot exceed ${maxLength} characters.`);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await addComment(videoId, text);

      setComment("");

      // Tell Comments.tsx to fetch the updated comments
      onCommentAdded();
    } catch (error: any) {
      console.error("Failed to add comment:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add comment.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setComment("");
    setError("");
  };

  return (
    <div className="mt-6">
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);

          if (error) {
            setError("");
          }
        }}
        maxLength={maxLength}
        placeholder="Add a comment..."
        disabled={loading}
        className="w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {/* Character count */}
      <div className="mt-1 flex justify-end">
        <span
          className={`text-xs ${
            comment.length >= maxLength
              ? "text-red-500"
              : "text-muted-foreground"
          }`}
        >
          {comment.length}/{maxLength}
        </span>
      </div>

      {/* Moderation/API error */}
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading || !comment}
          className="rounded-full px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !comment.trim()}
          className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Posting..." : "Comment"}
        </button>
      </div>
    </div>
  );
}