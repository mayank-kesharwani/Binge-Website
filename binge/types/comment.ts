export type CommentUser = {
  _id: string;
  name: string;
  username?: string;
  avatar: string;
};

export type Comment = {
  _id: string;

  video: string;

  user: CommentUser;

  text: string;

  language?: string;

  likes: number;

  dislikes: number;

  userReaction?: "like" | "dislike" | null;

  isReported?: boolean;

  isHidden?: boolean;

  moderationStatus?:
    | "approved"
    | "pending"
    | "rejected";

  isEdited: boolean;

  createdAt: string;

  updatedAt: string;
};