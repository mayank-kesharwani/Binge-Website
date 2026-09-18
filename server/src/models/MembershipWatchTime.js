import mongoose from "mongoose";

const membershipWatchTimeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    periodStart: {
      type: Date,
      default: null,
    },

    periodEnd: {
      type: Date,
      default: null,
    },

    activeSession: {
      type: Boolean,
      default: false,
    },

    sessionStartedAt: {
      type: Date,
      default: null,
    },

    lastHeartbeatAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const MembershipWatchTime = mongoose.model(
  "MembershipWatchTime",
  membershipWatchTimeSchema,
);

export default MembershipWatchTime;