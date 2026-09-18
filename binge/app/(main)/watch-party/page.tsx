"use client";

import { PartyPopper } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import JoinWatchParty from "@/components/watch-party/JoinWatchParty";

export default function WatchPartyPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <PartyPopper className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Binge Watch Party
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Watch videos together with your friends in real time, chat,
              video call, and share your screen.
            </p>
          </div>

          <JoinWatchParty />
        </div>
      </main>
    </ProtectedRoute>
  );
}