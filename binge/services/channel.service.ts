import api from "@/lib/axios";

export const getMyChannel = async () => {
  const response = await api.get("/channels/me");
  return response.data;
};

export const getChannelByHandle = async (
  handle: string
) => {
  const response = await api.get(
    `/channels/${handle}`
  );
  return response.data;
};

export const createChannel = async (
  formData: FormData
) => {
  const response = await api.post(
    "/channels",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateChannel = async (
  formData: FormData
) => {
  const response = await api.put(
    "/channels/me",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};