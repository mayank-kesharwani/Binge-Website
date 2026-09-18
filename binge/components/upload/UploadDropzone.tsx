"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  Video,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UploadForm } from "@/types/upload";

const MAX_SIZE = 1024; // MB

type Props = {
  video: File | null;
  setVideo: React.Dispatch<
    React.SetStateAction<File | null>
  >;
  setForm: React.Dispatch<
    React.SetStateAction<UploadForm>
  >;
};

export default function UploadDropzone({
  video,
  setVideo,
  setForm,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);

  const handleFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("video/")) {
      return toast.error(
        "Please select a video file."
      );
    }

    if (
      selectedFile.size >
      MAX_SIZE
    ) {
      return toast.error(
        `Video size should be less than ${MAX_SIZE} MB`
      );
    }

    setVideo(selectedFile);

    const videoElement =
      document.createElement("video");

    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(videoElement.src);

      setForm((prev) => ({
        ...prev,
        duration: Math.round(
          videoElement.duration
        ).toString(),
      }));
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(videoElement.src);

      toast.error(
        "Couldn't read the video metadata."
      );
    };

    videoElement.src =
      URL.createObjectURL(selectedFile);
  };

  const formatSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(
      size /
      1024 /
      1024
    ).toFixed(1)} MB`;
  };

  return (
    <section
      className="
        rounded-3xl
        border
        border-border
        bg-background
        p-8
        shadow-sm
      "
    >
      {/* Heading */}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">
          Upload Video
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Drag & drop your video or browse from your
          device.
        </p>
      </div>

      {/* Dropzone */}

      <div
        onClick={() => {
          if (!video) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          handleFile(
            e.dataTransfer.files?.[0] || null
          );
        }}
        className={`
          relative
          flex
          min-h-[280px]
          flex-col
          items-center
          justify-center
          rounded-3xl
          border-2
          border-dashed
          transition-all
          duration-300

          ${
            dragging
              ? "border-red-500 bg-red-50"
              : "border-border hover:border-red-400 hover:bg-red-50/40"
          }

          ${!video ? "cursor-pointer" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) =>
            handleFile(
              e.target.files?.[0] || null
            )
          }
        />

        {!video ? (
          <>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <UploadCloud className="h-12 w-12 text-red-500" />
            </div>

            <h3 className="text-xl font-semibold text-foreground">
              Drag & Drop Video
            </h3>

            <p className="mt-2 text-center text-muted-foreground">
              MP4, MOV, AVI, WEBM
              <br />
              Maximum file size {MAX_SIZE} MB
            </p>

            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="
                mt-8
                rounded-full
                bg-red-500
                px-8
                text-white
                hover:bg-red-600
              "
            >
              Select Video
            </Button>
          </>
        ) : (
          <>
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            <h3 className="text-lg font-bold text-foreground">
              Video Selected
            </h3>

            <div
              className="
                mt-5
                w-full
                max-w-xl
                rounded-2xl
                border
                border-border
                bg-muted
                p-5
              "
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
                  <Video className="h-7 w-7 text-red-500" />
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-foreground">
                    {video.name}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatSize(video.size)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="
                  rounded-full
                  border-border
                  hover:border-red-500
                  hover:bg-red-50
                  hover:text-red-500
                "
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Replace Video
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="rounded-full"
                onClick={(e) => {
                  e.stopPropagation();

                  setVideo(null);

                  setForm((prev) => ({
                    ...prev,
                    duration: "",
                  }));

                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
              >
                Remove
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}