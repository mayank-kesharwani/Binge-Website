import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    // Last position watched, in seconds
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Percentage of video watched
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// One history entry per user + video
watchHistorySchema.index(
  {
    user: 1,
    video: 1,
  },
  {
    unique: true,
  },
);

// Fast history queries
watchHistorySchema.index({
  user: 1,
  watchedAt: -1,
});

const History = mongoose.model(
  "WatchHistory",
  watchHistorySchema,
);

export default History;