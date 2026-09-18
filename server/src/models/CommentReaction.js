import mongoose from "mongoose";

const commentReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

commentReactionSchema.index(
  {
    user: 1,
    comment: 1,
  },
  {
    unique: true,
  },
);

const CommentReaction = mongoose.model(
  "CommentReaction",
  commentReactionSchema,
);

export default CommentReaction;