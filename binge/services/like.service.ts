import api from "@/lib/axios";

export const toggleVideoLike = async (
  videoId: string
) => {
  const response = await api.post(
    `/likes/video/${videoId}`
  );

  return response.data;
};

export const getVideoLikeStatus = async (
  videoId: string
) => {
  const response = await api.get(
    `/likes/video/status/${videoId}`
  );

  return response.data;
};

export const getLikedVideos = async () => {
  const response = await api.get(
    "/likes/me"
  );

  return response.data;
};