"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  toggleSubscription,
  getSubscriptionStatus,
} from "@/services/subscription.service";

import { useAuthStore } from "@/store/authStore";

type SubscribeButtonProps = {
  channelId: string;
  setSubscribedCount: React.Dispatch<
    React.SetStateAction<number>
  >;
};

export default function SubscribeButton({
  channelId,
  setSubscribedCount,
}: SubscribeButtonProps) {
  const { user, hasHydrated } = useAuthStore();

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // ===================================================
  // Get subscription status
  // ===================================================

  useEffect(() => {
    if (!hasHydrated) return;

    // Guest users don't need subscription status.
    // This prevents unauthorized API calls and errors.
    if (!user) {
      setSubscribed(false);
      setChecking(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        setChecking(true);

        const response =
          await getSubscriptionStatus(channelId);

        setSubscribed(
          Boolean(response.data?.subscribed),
        );
      } catch (error) {
        console.error(
          "Failed to fetch subscription status:",
          error,
        );
      } finally {
        setChecking(false);
      }
    };

    fetchStatus();
  }, [channelId, user, hasHydrated]);

  // ===================================================
  // Subscribe / Unsubscribe
  // ===================================================

  const handleSubscribe = async () => {
    if (!hasHydrated) return;

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const response =
        await toggleSubscription(channelId);

      setSubscribed(
        Boolean(response.data?.subscribed),
      );

      setSubscribedCount(
        Number(response.data?.subscribers ?? 0),
      );
    } catch (error) {
      console.error(
        "Failed to update subscription:",
        error,
      );

      toast.error(
        "Failed to update subscription",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <Button
      onClick={handleSubscribe}
      disabled={
        loading ||
        (!hasHydrated)
      }
      className={`rounded-full px-7 transition-all duration-300 ${
        subscribed
          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
          : "bg-red-500 text-white hover:bg-red-600"
      }`}
    >
      {loading || (checking && Boolean(user)) ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Bell className="mr-2 h-5 w-5" />
      )}

      {subscribed
        ? "Subscribed"
        : "Subscribe"}
    </Button>
  );
}