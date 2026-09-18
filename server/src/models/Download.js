import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      required: true,
    },

    videoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    videoPublicId: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    downloadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Download = mongoose.model(
  "Download",
  downloadSchema,
);

export default Download;