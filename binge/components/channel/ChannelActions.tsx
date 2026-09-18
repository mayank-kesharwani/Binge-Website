"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const ChannelActions = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [muted, setMuted] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">

      {/* Subscribe */}
      <Button
        onClick={() => setSubscribed(!subscribed)}
        className={`rounded-full px-6 transition-all duration-300 ${
          subscribed
            ? "bg-gray-900 hover:bg-black"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {subscribed ? (
          <>
            <BellRing className="mr-2 h-4 w-4" />
            Subscribed
          </>
        ) : (
          "Subscribe"
        )}
      </Button>

      {/* Bell */}
      {subscribed && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-gray-300 hover:border-red-500 hover:bg-red-50"
        >
          <Bell className="h-5 w-5" />
        </Button>
      )}

      {/* Mute */}
      <Button
        variant="secondary"
        onClick={() => setMuted(!muted)}
        className="rounded-full transition-all hover:bg-red-50 hover:text-red-500"
      >
        {muted ? (
          <>
            <VolumeX className="mr-2 h-4 w-4" />
            Unmute
          </>
        ) : (
          <>
            <Volume2 className="mr-2 h-4 w-4" />
            Mute
          </>
        )}
      </Button>
    </div>
  );
};

export default ChannelActions;