import api from "@/lib/axios";

export const toggleSubscription = async (
  channelId: string
) => {
  const response = await api.post(
    `/subscriptions/${channelId}`
  );
  
  return response.data;
};

export const getSubscriptionStatus = async (
  channelId: string
) => {
  const response = await api.get(
    `/subscriptions/status/${channelId}`
  );

  return response.data;
};

export const getMySubscriptions = async () => {
  const response = await api.get(
    "/subscriptions/me"
  );

  return response.data;
};

export const getChannelSubscribers = async (
  channelId: string
) => {
  const response = await api.get(
    `/subscriptions/channel/${channelId}`
  );

  return response.data;
};