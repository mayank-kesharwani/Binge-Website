"use client";

import Image from "next/image";

import formatTimeAgo from "@/lib/formatTimeAgo";
import { Comment } from "@/types/comment";
import CommentActions from "./CommentActions";
import { useAuthStore } from "@/store/authStore";

type CommentCardProps = {
  comment: Comment;
  onCommentChange: () => void;
};

export default function CommentCard({
  comment,
  onCommentChange,
}: CommentCardProps) {
  const { user, hasHydrated } = useAuthStore();

  if (!comment.user) return null;

  const isOwner =
    hasHydrated &&
    Boolean(user) &&
    user?._id === comment.user._id;

  return (
    <article className="flex gap-4 py-5">
      {/* Avatar */}

      <Image
        src={
          comment.user.avatar ||
          "https://ui-avatars.com/api/?name=User"
        }
        alt={comment.user.name || "User"}
        width={42}
        height={42}
        className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"
      />

      {/* Content */}

      <div className="min-w-0 flex-1">
        {/* User + time */}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 className="font-semibold text-foreground">
            {comment.user.username
              ? `@${comment.user.username}`
              : comment.user.name}
          </h4>

          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.createdAt)}
          </span>

          {comment.isEdited && (
            <span className="text-xs text-muted-foreground">
              • edited
            </span>
          )}
        </div>

        {/* Comment */}

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
          {comment.text}
        </p>

        {/* Actions */}

        <CommentActions
          commentId={comment._id}
          initialText={comment.text}
          initialLikes={comment.likes ?? 0}
          initialDislikes={comment.dislikes ?? 0}
          initialUserReaction={
            comment.userReaction ?? null
          }
          language={comment.language || "en"}
          isOwner={isOwner}
          onCommentChange={onCommentChange}
        />
      </div>
    </article>
  );
}