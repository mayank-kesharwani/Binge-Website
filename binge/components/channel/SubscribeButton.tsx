"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  toggleSubscription,
  getSubscriptionStatus,
} from "@/services/subscription.service";

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
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getSubscriptionStatus(channelId);

        setSubscribed(response.data.subscribed);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update subscription")
      } finally {
        setChecking(false);
      }
    };

    fetchStatus();
  }, [channelId]);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const response = await toggleSubscription(channelId);

      setSubscribed(response.data.subscribed);

      setSubscribedCount(response.data.subscribers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading || checking}
      className={`rounded-full px-7 transition-all duration-300 ${
        subscribed
          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
          : "bg-red-500 text-white hover:bg-red-600"
      }`}
    >
      {loading || checking ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Bell className="mr-2 h-5 w-5" />
      )}

      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}