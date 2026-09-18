import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Language of the original comment
    language: {
      type: String,
      default: "en",
      trim: true,
      lowercase: true,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    dislikes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Report/moderation status
    isReported: {
      type: Boolean,
      default: false,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },

    // Reason/status can be used by moderation later
    moderationStatus: {
      type: String,
      enum: [
        "approved",
        "pending",
        "rejected",
      ],
      default: "approved",
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

commentSchema.index({
  video: 1,
  createdAt: -1,
});

const Comment = mongoose.model(
  "Comment",
  commentSchema,
);

export default Comment;