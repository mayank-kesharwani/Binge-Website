"use client";

import { useCallback, useEffect, useState } from "react";

import CommentInput from "./CommentInput";
import CommentCard from "./CommentCard";
import EmptyComments from "./EmptyComments";
import CommentSkeleton from "./CommentsSkeleton";

import { getComments } from "@/services/comment.service";
import { Comment } from "@/types/comment";

type CommentsProps = {
  videoId: string;
};

export default function Comments({
  videoId,
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getComments(videoId);

      setComments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentChange = () => {
    fetchComments();
  };

  return (
    <section className="mt-8">
      {/* Header */}
      <h2 className="text-xl font-bold text-foreground">
        Comments ({comments.length})
      </h2>

      {/* Add comment */}
      <CommentInput
        videoId={videoId}
        onCommentAdded={handleCommentChange}
      />

      {/* Loading */}
      {loading ? (
        <div className="mt-6 space-y-6">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <EmptyComments />
      ) : (
        <div className="mt-6 divide-y divide-border">
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onCommentChange={handleCommentChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}