import api from "@/lib/axios";

export const toggleWatchLater = async (
  videoId: string,
) => {
  const response = await api.post(
    `/watch-later/${videoId}`,
  );

  return response.data;
};

export const getWatchLaterStatus = async (
  videoId: string,
) => {
  const response = await api.get(
    `/watch-later/status/${videoId}`,
  );

  return response.data;
};

export const getMyWatchLater = async () => {
  const response = await api.get("/watch-later/me");

  return response.data;
};

export const removeFromWatchLater = async (
  videoId: string,
) => {
  const response = await api.delete(
    `/watch-later/${videoId}`,
  );

  return response.data;
};