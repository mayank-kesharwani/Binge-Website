import api from "@/lib/axios";

export const getMembershipPlans = async () => {
  const response = await api.get("/membership/plans");

  return response.data;
};

export const getMyMembership = async () => {
  const response = await api.get("/membership/me");

  return response.data;
};

export const getMyPaymentHistory = async () => {
  const response = await api.get(
    "/membership/payments",
  );

  return response.data;
};

export const createMembershipOrder = async (
  plan: string,
) => {
  const response = await api.post(
    "/membership/create-order",
    {
      plan,
    },
  );

  return response.data;
};

export const verifyMembershipPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post(
    "/membership/verify-payment",
    {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
  );

  return response.data;
};

// =====================================================
// Watch Time
// =====================================================

export const getWatchTimeUsage = async () => {
  const response = await api.get(
    "/membership/watch-time",
  );

  return response.data;
};

export const startWatchSession = async () => {
  const response = await api.post(
    "/membership/watch-time/start",
  );

  return response.data;
};

export const heartbeatWatchSession = async () => {
  const response = await api.post(
    "/membership/watch-time/heartbeat",
  );

  return response.data;
};

export const stopWatchSession = async () => {
  const response = await api.post(
    "/membership/watch-time/stop",
  );

  return response.data;
};

// =====================================================
// Ad Visibility
// =====================================================

export const getAdStatus = async () => {
  const response = await api.get(
    "/membership/me",
  );

  return {
    adFree: response.data?.data?.adFree ?? false,
  };
};