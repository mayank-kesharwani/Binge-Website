import mongoose from "mongoose";

const commentReportSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "abuse",
        "spam",
        "hate",
        "harassment",
        "sexual",
        "violence",
        "other",
      ],
      required: true,
    },

    details: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed", "action_taken"],
      default: "pending",
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    moderatedAt: {
      type: Date,
      default: null,
    },

    action: {
      type: String,
      enum: ["none", "dismiss", "hide", "delete"],
      default: "none",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

commentReportSchema.index(
  {
    comment: 1,
    reporter: 1,
  },
  {
    unique: true,
  },
);

const CommentReport = mongoose.model("CommentReport", commentReportSchema);

export default CommentReport;
