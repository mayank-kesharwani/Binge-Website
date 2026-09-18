import api from "@/lib/axios";

export const getNotifications = async () => {
  const response = await api.get("/notifications");

  return response.data;
};

export const markNotificationAsRead = async (
  id: string,
) => {
  const response = await api.patch(
    `/notifications/${id}/read`,
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all",
  );

  return response.data;
};

export const deleteNotification = async (
  id: string,
) => {
  const response = await api.delete(
    `/notifications/${id}`,
  );

  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete(
    "/notifications/all",
  );

  return response.data;
};