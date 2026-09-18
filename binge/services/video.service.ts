import api from "@/lib/axios";

export const getAllVideos = async () => {
  const response = await api.get("/videos");
  return response.data;
};

export const getVideoById = async (id: string) => {
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

export const getVideoForEdit = async (id: string) => {
  const response = await api.get(`/videos/edit/${id}`);
  return response.data;
};

export const searchVideos = async (query: string) => {
  const response = await api.get(`/videos/search?q=${query}`);
  return response.data;
};

export const uploadVideo = async (formData: FormData) => {
  const response = await api.post("/videos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateVideo = async (
  id: string,
  formData: FormData,
) => {
  const response = await api.put(
    `/videos/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const deleteVideo = async (id: string) => {
  const response = await api.delete(`/videos/${id}`);
  return response.data;
};

export const getVideosByChannel = async (
  handle: string,
) => {
  const response = await api.get(
    `/videos/channel/${handle}`,
  );

  return response.data;
};

export const getMyVideos = async () => {
  const response = await api.get("/videos/me");
  return response.data;
};

// =====================================================
// Video Downloads
// =====================================================

export const downloadVideo = async (id: string) => {
  const response = await api.get(
    `/downloads/${id}`,
  );

  return response.data;
};

export const getMyDownloads = async () => {
  const response = await api.get(
    "/users/downloads",
  );

  return response.data;
};