"use client";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
} from "lucide-react";

type VideoControlsProps = {
  isPlaying: boolean;
  muted: boolean;
  currentTime: number;
  duration: number;
  progress: number;

  onPlayPause: () => void;
  onMute: () => void;
  onSeek: (percentage: number) => void;
  isFullscreen: boolean;
  onFullscreen: () => void;
  showControls: boolean;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onNext?: () => void;
};

const formatTime = (time: number) => {
  if (!time || Number.isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function VideoControls({
  isPlaying,
  muted,
  currentTime,
  duration,
  progress,
  onPlayPause,
  onMute,
  onSeek,
  onFullscreen,
  isFullscreen,
  showControls,
  onSkipForward,
  onSkipBackward,
  onNext,
}: VideoControlsProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="pointer-events-auto relative p-4">
        {/* Progress Bar */}
        <div
          className="group mb-4 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();

            const percentage = Math.min(
              1,
              Math.max(0, (e.clientX - rect.left) / rect.width),
            );

            onSeek(percentage);
          }}
        >
          <div className="relative h-1 rounded-full bg-white/30 transition-all group-hover:h-1.5">
            <div
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-red-500"
            />

            <div
              style={{
                left: `calc(${progress}% - 7px)`,
              }}
              className="absolute top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-red-500 group-hover:block"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkipBackward}
              className="rounded-full p-2 text-white transition hover:bg-white/20"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onPlayPause}
              className="rounded-full p-2 text-white transition hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-white" />
              ) : (
                <Play className="h-6 w-6 fill-white" />
              )}
            </button>

            <button
              type="button"
              onClick={onSkipForward}
              className="rounded-full p-2 text-white transition hover:bg-white/20"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onMute}
              className="rounded-full p-2 text-white transition hover:bg-white/20"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>

            <span className="text-sm font-medium text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="rounded-full p-2 text-white transition hover:bg-white/20"
                title="Next video"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onFullscreen}
              className="rounded-full p-2 text-white transition hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}