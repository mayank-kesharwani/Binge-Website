"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SubscriptionsEmpty from "@/components/subscriptions/SubscriptionsEmpty";
import SubscriptionsGrid from "@/components/subscriptions/SubscriptionsGrid";
import SubscriptionsHeader from "@/components/subscriptions/SubscriptionsHeader";
import { getMySubscriptions } from "@/services/subscription.service";

type SubscriptionChannel = {
  _id: string;
  channelName: string;
  handle: string;
  avatar: string;
  banner?: string;
  subscribers: number;
  isVerified: boolean;
  description?: string;
};

export default function SubscriptionsPage() {
  const [channels, setChannels] = useState<SubscriptionChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMySubscriptions();

        setChannels(response.data ?? []);
      } catch (error: any) {
        console.error("Failed to load subscriptions:", error);

        const message =
          error?.response?.data?.message ||
          "Unable to load your subscriptions";

        setError(message);
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const handleSubscriptionChange = (channelId: string) => {
    setChannels((currentChannels) =>
      currentChannels.filter((channel) => channel._id !== channelId),
    );
  };

  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SubscriptionsHeader />

          {loading && (
            <div className="flex min-h-[45vh] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-red-500" />
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[45vh] flex-col items-center justify-center px-4 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Something went wrong
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && channels.length === 0 && (
            <SubscriptionsEmpty />
          )}

          {!loading && !error && channels.length > 0 && (
            <>
              <div className="mb-5">
                <p className="text-sm text-muted-foreground">
                  {channels.length}{" "}
                  {channels.length === 1 ? "subscription" : "subscriptions"}
                </p>
              </div>

              <SubscriptionsGrid
                channels={channels}
                onSubscriptionChange={handleSubscriptionChange}
              />
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}