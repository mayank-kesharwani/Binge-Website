export type Channel = {
  _id: string;
  channelName: string;
  handle: string;
  avatar: string;
  subscribers: number;
  isVerified: boolean;
  description: string;
  isSubscribed?: boolean;
  isOwner: boolean;
};

export type Video = {
  _id: string;

  title: string;
  description: string;

  videoUrl: string;
  thumbnailUrl: string;

  duration: number;

  views: number;
  likes: number;

  isLiked?: boolean;
  isSaved?: boolean;
  
  createdAt: string;

  category: string;
  tags: string[];

  channel: Channel;
};