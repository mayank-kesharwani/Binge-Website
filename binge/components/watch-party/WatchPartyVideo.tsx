"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  getWatchPartySocket,
} from "@/lib/watchPartySocket";

interface WatchPartyVideoProps {
  videoUrl: string;
  thumbnailUrl?: string;
  partyCode: string;
  isHost: boolean;
  initialCurrentTime?: number;
  initialIsPlaying?: boolean;
}

const WatchPartyVideo = ({
  videoUrl,
  thumbnailUrl,
  partyCode,
  isHost,
  initialCurrentTime = 0,
  initialIsPlaying = false,
}: WatchPartyVideoProps) => {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const isRemoteUpdate =
    useRef(false);

  const initialStateApplied =
    useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !partyCode) {
      return;
    }

    const applyRemoteState = (
      callback: () => void,
    ) => {
      isRemoteUpdate.current = true;

      callback();

      window.setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 150);
    };

    const handleRemotePlay = ({
      currentTime,
    }: {
      currentTime?: number;
    }) => {
      applyRemoteState(() => {
        if (
          typeof currentTime === "number"
        ) {
          video.currentTime =
            currentTime;
        }

        void video.play().catch(() => {});
      });
    };

    const handleRemotePause = ({
      currentTime,
    }: {
      currentTime?: number;
    }) => {
      applyRemoteState(() => {
        if (
          typeof currentTime === "number"
        ) {
          video.currentTime =
            currentTime;
        }

        video.pause();
      });
    };

    const handleRemoteSeek = ({
      currentTime,
    }: {
      currentTime?: number;
    }) => {
      if (
        typeof currentTime !== "number"
      ) {
        return;
      }

      applyRemoteState(() => {
        video.currentTime =
          currentTime;
      });
    };

    const handlePartyState = ({
      party,
    }: {
      party?: {
        playback?: {
          currentTime?: number;
          isPlaying?: boolean;
        };
      };
    }) => {
      const playback =
        party?.playback;

      if (!playback) {
        return;
      }

      applyRemoteState(() => {
        if (
          typeof playback.currentTime ===
          "number"
        ) {
          video.currentTime =
            playback.currentTime;
        }

        if (playback.isPlaying) {
          void video
            .play()
            .catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    const socket =
      getWatchPartySocket();

    socket.on(
      "watch-party:play",
      handleRemotePlay,
    );

    socket.on(
      "watch-party:pause",
      handleRemotePause,
    );

    socket.on(
      "watch-party:seek",
      handleRemoteSeek,
    );

    socket.on(
      "watch-party:state",
      handlePartyState,
    );

    if (!initialStateApplied.current) {
      initialStateApplied.current =
        true;

      applyRemoteState(() => {
        if (
          Number.isFinite(
            initialCurrentTime,
          )
        ) {
          video.currentTime =
            Math.max(
              0,
              initialCurrentTime,
            );
        }

        if (
          initialIsPlaying &&
          !video.paused
        ) {
          return;
        }

        if (
          initialIsPlaying
        ) {
          void video
            .play()
            .catch(() => {});
        }
      });
    }

    return () => {
      socket.off(
        "watch-party:play",
        handleRemotePlay,
      );

      socket.off(
        "watch-party:pause",
        handleRemotePause,
      );

      socket.off(
        "watch-party:seek",
        handleRemoteSeek,
      );

      socket.off(
        "watch-party:state",
        handlePartyState,
      );
    };
  }, [
    partyCode,
    initialCurrentTime,
    initialIsPlaying,
  ]);

  const handlePlay = () => {
    if (
      !isHost ||
      isRemoteUpdate.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    getWatchPartySocket().emit(
      "watch-party:play",
      {
        currentTime:
          video.currentTime,
      },
    );
  };

  const handlePause = () => {
    if (
      !isHost ||
      isRemoteUpdate.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    getWatchPartySocket().emit(
      "watch-party:pause",
      {
        currentTime:
          video.currentTime,
      },
    );
  };

  const handleSeeked = () => {
    if (
      !isHost ||
      isRemoteUpdate.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    getWatchPartySocket().emit(
      "watch-party:seek",
      {
        currentTime:
          video.currentTime,
      },
    );
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        controls={isHost}
        playsInline
        preload="metadata"
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        className="h-full w-full object-contain"
      />

      {!isHost && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
          Host controls playback
        </div>
      )}
    </div>
  );
};

export default WatchPartyVideo;