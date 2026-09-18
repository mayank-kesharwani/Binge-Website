export type NotificationType =
  | "new_video"
  | "subscription"
  | "like"
  | "comment"
  | "reply"
  | "profile"
  | "password"
  | "preferences"
  | "video"
  | "channel"
  | "system";

export type Notification = {
  _id: string;

  type: NotificationType;

  title: string;

  message: string;

  read: boolean;

  createdAt: string;

  sender?: {
    _id: string;
    name: string;
    avatar: string;
  } | null;

  video?: {
    _id: string;
    title: string;
    thumbnailUrl: string;
  } | null;

  channel?: {
    _id: string;
    channelName: string;
    handle: string;
    avatar: string;
  } | null;
};

export type NotificationsResponse = {
  success: boolean;

  data: Notification[];

  unreadCount: number;
};