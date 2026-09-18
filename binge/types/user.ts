export type MembershipPlan =
  | "free"
  | "bronze"
  | "silver"
  | "gold";

export type MembershipStatus =
  | "active"
  | "expired"
  | "cancelled";

export type UserMembership = {
  plan: MembershipPlan;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  lastPaymentId: string;
  razorpayCustomerId: string;
};

export type UserProfile = {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: string;

  membership: UserMembership;
};

export type UserProfileForm = {
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
};

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type NotificationPreferences = {
  newVideos: boolean;
  newSubscribers: boolean;
  likes: boolean;
  comments: boolean;
  replies: boolean;
  accountUpdates: boolean;
  systemUpdates: boolean;
};

export type PreferenceForm = {
  theme: "system" | "light" | "dark";
  autoplay: boolean;
  inlinePlayback: boolean;
  rememberProgress: boolean;
  language: string;
  notifications: NotificationPreferences;
};