import api from "@/lib/axios";
import type { PreferenceForm } from "@/types/user";

export const getMyProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const getMyDownloads = async () => {
  const response = await api.get("/users/downloads");
  return response.data;
};

export const updateProfile = async (
  formData: FormData,
) => {
  const response = await api.put(
    "/users/me",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await api.put(
    "/users/password",
    data,
  );

  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/users/me");

  return response.data;
};

export const getPreferences = async () => {
  const response = await api.get(
    "/users/preferences",
  );

  return response.data;
};

export const updatePreferences = async (
  data: PreferenceForm,
) => {
  const response = await api.put(
    "/users/preferences",
    data,
  );

  return response.data;
};