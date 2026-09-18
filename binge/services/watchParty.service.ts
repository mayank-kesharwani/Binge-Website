import api from "@/lib/axios";

export type WatchPartyUser = {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
};

export type WatchPartyParticipant = {
  user: WatchPartyUser;
  joinedAt: string;
};

export type WatchPartyPlayback = {
  currentTime: number;
  isPlaying: boolean;
};

export type WatchParty = {
  _id: string;
  partyCode: string;
  host: WatchPartyUser;
  video: {
    _id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    views?: number;
    channel?: unknown;
  };
  participants: WatchPartyParticipant[];
  status: "active" | "ended";
  playback: WatchPartyPlayback;
  recording?: {
    enabled: boolean;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  endedAt?: string | null;
};

export const createWatchParty = async (
  videoId: string,
) => {
  const response = await api.post("/watch-party", {
    videoId,
  });

  return response.data;
};

export const joinWatchParty = async (
  partyCode: string,
) => {
  const response = await api.post(
    `/watch-party/join/${partyCode}`,
  );

  return response.data;
};

export const getWatchParty = async (
  partyCode: string,
) => {
  const response = await api.get(
    `/watch-party/${partyCode}`,
  );

  return response.data;
};

export const endWatchParty = async (
  partyCode: string,
) => {
  const response = await api.delete(
    `/watch-party/${partyCode}`,
  );

  return response.data;
};