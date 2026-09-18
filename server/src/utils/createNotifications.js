import User from "../models/User.js";
import Notification from "../models/notification.model.js";

const preferenceMap = {
  new_video: "newVideos",
  subscription: "newSubscribers",
  like: "likes",
  comment: "comments",
  reply: "replies",
  profile: "accountUpdates",
  password: "accountUpdates",
  preferences: "accountUpdates",
  video: "systemUpdates",
  channel: "systemUpdates",
  system: "systemUpdates",
};

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  sender = null,
  video = null,
  channel = null,
}) => {
  try {
    if (!recipient) {
      console.error(
        "Notification recipient is required",
      );

      return null;
    }

    const user = await User.findById(recipient)
      .select("preferences.notifications")
      .lean();

    if (!user) {
      return null;
    }

    const preferenceKey = preferenceMap[type];

    if (preferenceKey) {
      const enabled =
        user.preferences?.notifications?.[
          preferenceKey
        ] ?? true;

      if (!enabled) {
        return null;
      }
    }

    const notification =
      await Notification.create({
        recipient,
        type,
        title,
        message,
        sender,
        video,
        channel,
      });

    return notification;
  } catch (error) {
    console.error(
      "Failed to create notification:",
      error,
    );

    return null;
  }
};

export default createNotification;