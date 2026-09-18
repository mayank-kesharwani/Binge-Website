import api from "@/lib/axios";

export const getHistory = async () => {
  const response = await api.get("/history");

  return response.data;
};

export const addToHistory = async (
  videoId: string,
) => {
  const response = await api.post(
    `/history/${videoId}`,
  );

  return response.data;
};

export const removeFromHistory = async (
  videoId: string,
) => {
  const response = await api.delete(
    `/history/${videoId}`,
  );

  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete("/history");

  return response.data;
};

// -----------------------------
// History settings
// -----------------------------

export const getHistorySettings = async () => {
  const response = await api.get(
    "/history/settings",
  );

  return response.data;
};

export const setHistoryPaused = async (
  paused: boolean,
) => {
  const response = await api.patch(
    "/history/settings",
    {
      paused,
    },
  );

  return response.data;
};