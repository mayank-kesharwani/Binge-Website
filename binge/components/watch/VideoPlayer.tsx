"use client";

import {
  getWatchTimeUsage,
  startWatchSession,
  heartbeatWatchSession,
  stopWatchSession,
} from "@/services/membership.service";
import { addToHistory } from "@/services/history.service";

import { useAuthStore } from "@/store/authStore";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import VideoControls from "./VideoControls";

import { Loader2, RotateCcw, RotateCw, Crown, LockKeyhole } from "lucide-react";

type VideoPlayerProps = {
  video: {
    _id: string;
    title: string;
    videoUrl: string | null;
    thumbnailUrl: string;
    isPremium?: boolean;
    premiumAccess?: boolean;
  };
  nextVideoId?: string;
};

export default function VideoPlayer({ video, nextVideoId }: VideoPlayerProps) {
  const router = useRouter();

  const { user, hasHydrated } = useAuthStore();

  const playerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const historyAdded = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const [muted, setMuted] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [showControls, setShowControls] = useState(true);

  const hideControlsTimeout = useRef<number | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [skipFeedback, setSkipFeedback] = useState<
    "forward" | "backward" | null
  >(null);

  const [watchTimeLimitReached, setWatchTimeLimitReached] = useState(false);

  const watchTimeTimer = useRef<number | null>(null);

  const watchSessionActive = useRef(false);

  const watchTimeRequestInProgress = useRef(false);

  const lastTapTime = useRef(0);

  const lastTapX = useRef(0);

  const hasPremiumAccess = !video.isPremium || video.premiumAccess;

  // =====================================================
  // Stop Watch Session
  // =====================================================

  const stopWatchSessionSafely = async () => {
    if (!watchSessionActive.current) {
      return;
    }

    watchSessionActive.current = false;

    if (!hasHydrated || !user) {
      return;
    }

    try {
      await stopWatchSession();
    } catch (error) {
      console.error("Failed to stop watch session:", error);
    }
  };

  // =====================================================
  // Start Watch Session
  // =====================================================

  const startWatchSessionSafely = async () => {
    /*
     * Guests can watch public videos,
     * but they don't have a membership
     * watch-time session.
     */
    if (!hasHydrated || !user) {
      return true;
    }

    if (
      !hasPremiumAccess ||
      watchTimeLimitReached ||
      watchSessionActive.current ||
      watchTimeRequestInProgress.current
    ) {
      return false;
    }

    watchTimeRequestInProgress.current = true;

    try {
      const response = await startWatchSession();

      const data = response?.data;

      if (!data) {
        return false;
      }

      if (data.limitReached) {
        setWatchTimeLimitReached(true);

        if (videoRef.current) {
          videoRef.current.pause();
        }

        return false;
      }

      watchSessionActive.current = true;

      return true;
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setWatchTimeLimitReached(true);

        if (videoRef.current) {
          videoRef.current.pause();
        }
      } else {
        console.error("Failed to start watch session:", error);
      }

      return false;
    } finally {
      watchTimeRequestInProgress.current = false;
    }
  };

  // =====================================================
  // Watch-Time Heartbeat
  // =====================================================

  const sendWatchTimeHeartbeat = async () => {
    if (
      !hasHydrated ||
      !user ||
      !watchSessionActive.current ||
      watchTimeRequestInProgress.current ||
      !videoRef.current ||
      videoRef.current.paused ||
      videoRef.current.ended
    ) {
      return;
    }

    watchTimeRequestInProgress.current = true;

    try {
      const response = await heartbeatWatchSession();

      const data = response?.data;

      if (!data) return;

      if (data.limitReached) {
        setWatchTimeLimitReached(true);

        if (videoRef.current) {
          videoRef.current.pause();
        }

        watchSessionActive.current = false;
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setWatchTimeLimitReached(true);

        if (videoRef.current) {
          videoRef.current.pause();
        }

        watchSessionActive.current = false;
      } else if (error?.response?.status === 400) {
        /*
         * The backend no longer considers
         * this session active.
         */
        watchSessionActive.current = false;
      } else {
        console.error("Failed to update watch time:", error);
      }
    } finally {
      watchTimeRequestInProgress.current = false;
    }
  };

  // =====================================================
  // Play / Pause
  // =====================================================

  const togglePlay = async () => {
    if (!videoRef.current || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    if (videoRef.current.paused) {
      const started = await startWatchSessionSafely();

      if (!started) {
        return;
      }

      videoRef.current.play().catch((error) => {
        watchSessionActive.current = false;

        if (error?.name !== "AbortError") {
          console.error("Video playback failed:", error);
        }
      });
    } else {
      videoRef.current.pause();
    }
  };

  // =====================================================
  // Mute
  // =====================================================

  const toggleMute = () => {
    if (!videoRef.current || !hasPremiumAccess) {
      return;
    }

    videoRef.current.muted = !videoRef.current.muted;

    setMuted(videoRef.current.muted);
  };

  // =====================================================
  // Seek
  // =====================================================

  const handleSeek = (percentage: number) => {
    if (!videoRef.current || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    const seekTime = percentage * duration;

    videoRef.current.currentTime = seekTime;

    setCurrentTime(seekTime);
  };

  // =====================================================
  // Skip Feedback
  // =====================================================

  const showSkipFeedback = (direction: "forward" | "backward") => {
    setSkipFeedback(direction);

    setTimeout(() => {
      setSkipFeedback(null);
    }, 700);
  };

  // =====================================================
  // Skip Forward
  // =====================================================

  const skipForward = () => {
    if (!videoRef.current || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + 10,
      duration,
    );

    showSkipFeedback("forward");
  };

  // =====================================================
  // Skip Backward
  // =====================================================

  const skipBackward = () => {
    if (!videoRef.current || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - 10,
      0,
    );

    showSkipFeedback("backward");
  };

  // =====================================================
  // Double Click
  // =====================================================

  const handleDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    const rect = videoRef.current.getBoundingClientRect();

    const clickPosition = e.clientX - rect.left;

    const width = rect.width;

    if (clickPosition < width / 3) {
      skipBackward();
    } else if (clickPosition > (width * 2) / 3) {
      skipForward();
    }
  };

  // =====================================================
  // Touch
  // =====================================================

  const handleTouchEnd = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (!videoRef.current || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    const now = Date.now();

    const touch = e.changedTouches[0];

    if (!touch) return;

    const rect = videoRef.current.getBoundingClientRect();

    const tapX = touch.clientX - rect.left;

    const timeSinceLastTap = now - lastTapTime.current;

    if (timeSinceLastTap < 300) {
      const width = rect.width;

      if (tapX < width / 3) {
        skipBackward();
      } else if (tapX > (width * 2) / 3) {
        skipForward();
      }

      lastTapTime.current = 0;

      return;
    }

    lastTapTime.current = now;

    lastTapX.current = tapX;
  };

  // =====================================================
  // Fullscreen
  // =====================================================

  const toggleFullscreen = async () => {
    if (!playerRef.current || !hasPremiumAccess) {
      return;
    }

    if (!document.fullscreenElement) {
      await playerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  // =====================================================
  // Next Video
  // =====================================================

  const handleNext = () => {
    if (!nextVideoId) return;

    router.push(`/watch/${nextVideoId}`);
  };

  // =====================================================
  // Mouse Controls
  // =====================================================

  const handleMouseMove = () => {
    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // =====================================================
  // Initial Watch-Time Check
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const checkWatchTime = async () => {
      /*
       * Don't call membership APIs until
       * Zustand has hydrated.
       *
       * Guests don't have watch-time limits.
       */
      if (!hasHydrated || !user || !hasPremiumAccess) {
        return;
      }

      try {
        const response = await getWatchTimeUsage();

        const data = response?.data;

        if (!mounted || !data) return;

        if (data.limitReached) {
          setWatchTimeLimitReached(true);

          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      } catch (error) {
        console.error("Failed to check watch-time usage:", error);
      }
    };

    checkWatchTime();

    return () => {
      mounted = false;
    };
  }, [hasHydrated, user, hasPremiumAccess]);

  // =====================================================
  // Server Watch-Time Heartbeat
  // =====================================================

  useEffect(() => {
    if (!hasHydrated || !user || !hasPremiumAccess || watchTimeLimitReached) {
      return;
    }

    watchTimeTimer.current = window.setInterval(() => {
      sendWatchTimeHeartbeat();
    }, 10000);

    return () => {
      if (watchTimeTimer.current) {
        clearInterval(watchTimeTimer.current);

        watchTimeTimer.current = null;
      }
    };
  }, [hasHydrated, user, hasPremiumAccess, watchTimeLimitReached]);

  // =====================================================
  // Video Events
  // =====================================================

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !hasPremiumAccess) {
      return;
    }

    const onWaiting = () => setIsLoading(true);

    const onPlaying = () => setIsLoading(false);

    const onCanPlay = () => setIsLoading(false);

    const onLoaded = () => setDuration(videoElement.duration);

    const onTimeUpdate = () => setCurrentTime(videoElement.currentTime);

    const onPlay = async () => {
      if (watchTimeLimitReached) {
        videoElement.pause();
        return;
      }

      /*
       * Logged-in users get a membership
       * watch session.
       *
       * Guests can play without one.
       */
      if (hasHydrated && user) {
        if (!watchSessionActive.current) {
          const started = await startWatchSessionSafely();

          if (!started) {
            videoElement.pause();
            return;
          }
        }
      }

      setIsPlaying(true);
      setShowControls(true);

      /*
       * History is account-specific.
       * Never call it for guests.
       */
      if (hasHydrated && user && !historyAdded.current) {
        historyAdded.current = true;

        addToHistory(video._id).catch((error) => {
          console.error("Failed to add video to history:", error);
        });
      }

      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }

      hideControlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);

      stopWatchSessionSafely();
    };

    const onEnded = () => {
      setIsPlaying(false);
      setShowControls(true);

      stopWatchSessionSafely();
    };

    videoElement.addEventListener("loadedmetadata", onLoaded);

    videoElement.addEventListener("timeupdate", onTimeUpdate);

    videoElement.addEventListener("play", onPlay);

    videoElement.addEventListener("pause", onPause);

    videoElement.addEventListener("ended", onEnded);

    videoElement.addEventListener("waiting", onWaiting);

    videoElement.addEventListener("playing", onPlaying);

    videoElement.addEventListener("canplay", onCanPlay);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      videoElement.removeEventListener("loadedmetadata", onLoaded);

      videoElement.removeEventListener("timeupdate", onTimeUpdate);

      videoElement.removeEventListener("play", onPlay);

      videoElement.removeEventListener("pause", onPause);

      videoElement.removeEventListener("ended", onEnded);

      videoElement.removeEventListener("waiting", onWaiting);

      videoElement.removeEventListener("playing", onPlaying);

      videoElement.removeEventListener("canplay", onCanPlay);

      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }

      stopWatchSessionSafely();
    };
  }, [video._id, hasPremiumAccess, watchTimeLimitReached, hasHydrated, user]);

  // =====================================================
  // History
  // =====================================================


  // =====================================================
  // Keyboard Controls
  // =====================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!hasPremiumAccess || watchTimeLimitReached) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;

        case "arrowleft":
          e.preventDefault();
          skipBackward();
          break;

        case "arrowright":
          e.preventDefault();
          skipForward();
          break;

        case "m":
          toggleMute();
          break;

        case "f":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [duration, hasPremiumAccess, watchTimeLimitReached]);

  // =====================================================
  // Progress
  // =====================================================
  
  const progress = duration === 0 ? 0 : (currentTime / duration) * 100;

  // =====================================================
  // Premium Access
  // =====================================================

  if (video.isPremium && !video.premiumAccess) {
    return (
      <div
        ref={playerRef}
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-black shadow-xl"
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="relative z-10 mx-4 flex max-w-md flex-col items-center rounded-2xl border border-border bg-card/95 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Crown className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-bold text-foreground">Premium Video</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            This video is available to Binge Premium members. Upgrade your
            membership to start watching.
          </p>

          <button
            type="button"
            onClick={() => router.push("/settings/membership")}
            className="mt-6 flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <LockKeyhole className="h-4 w-4" />
            Upgrade Membership
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // Player
  // =====================================================

  return (
    <div
      ref={playerRef}
      className="relative overflow-hidden rounded-2xl bg-black shadow-xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      <video
        ref={videoRef}
        preload="metadata"
        playsInline
        poster={video.thumbnailUrl}
        className="aspect-video w-full bg-black object-contain"
        onClick={togglePlay}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={handleTouchEnd}
      >
        <source src={video.videoUrl ?? undefined} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}

      {skipFeedback && (
        <div
          className={`pointer-events-none absolute top-1/2 z-20 flex -translate-y-1/2 items-center justify-center ${
            skipFeedback === "forward" ? "right-[20%]" : "left-[20%]"
          }`}
        >
          <div className="flex h-20 w-20 animate-in zoom-in-75 flex-col items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm duration-200">
            {skipFeedback === "forward" ? (
              <RotateCw className="h-8 w-8" />
            ) : (
              <RotateCcw className="h-8 w-8" />
            )}

            <span className="text-sm font-semibold">10 seconds</span>
          </div>
        </div>
      )}

      {watchTimeLimitReached && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-foreground">
              Watch-Time Limit Reached
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You have reached your watch-time limit for your current
              membership. Upgrade your membership to get more watch time.
            </p>

            <button
              type="button"
              onClick={() => router.push("/settings/membership")}
              className="mt-5 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Upgrade Membership
            </button>
          </div>
        </div>
      )}

      <VideoControls
        isPlaying={isPlaying && !watchTimeLimitReached}
        muted={muted}
        currentTime={currentTime}
        duration={duration}
        progress={progress}
        showControls={showControls && !watchTimeLimitReached}
        onPlayPause={togglePlay}
        onMute={toggleMute}
        onSeek={handleSeek}
        onFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onNext={nextVideoId ? handleNext : undefined}
      />
    </div>
  );
}
