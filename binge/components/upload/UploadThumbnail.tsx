"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  ImagePlus,
  Trash2,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  thumbnail: File | null;
  setThumbnail: React.Dispatch<
    React.SetStateAction<File | null>
  >;

  initialThumbnail?: string;
};

export default function UploadThumbnail({
  thumbnail,
  setThumbnail,
  initialThumbnail,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = thumbnail
    ? URL.createObjectURL(thumbnail)
    : initialThumbnail?.trim() || null;

  const handleThumbnail = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image.");
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast.error(
        "Thumbnail must be less than 2 MB."
      );
    }

    setThumbnail(file);
  };

  return (
    <section
      className="
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        p-6
        shadow-sm
        text-[var(--foreground)]
      "
    >
      <h2 className="text-lg font-bold">
        Video Thumbnail
      </h2>

      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Upload a custom thumbnail that attracts viewers.
      </p>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={handleThumbnail}
      />

      <div className="mt-6">
        {preview ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <Image
              src={preview}
              alt="Thumbnail"
              width={600}
              height={340}
              className="
                aspect-video
                w-full
                object-cover
                transition
                duration-300
                hover:scale-105
              "
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="
              group
              flex
              aspect-video
              w-full
              flex-col
              items-center
              justify-center
              rounded-2xl
              border-2
              border-dashed
              border-[var(--border)]
              bg-[var(--muted)]
              transition-all
              duration-300
              hover:border-red-500
            "
          >
            <div
              className="
                mb-4
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-red-100
                transition
                group-hover:scale-110
              "
            >
              <ImagePlus className="h-8 w-8 text-red-500" />
            </div>

            <p className="font-semibold">
              Upload Thumbnail
            </p>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              JPG, PNG, WEBP
            </p>
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={() => inputRef.current?.click()}
          className="
            flex-1
            rounded-full
            bg-red-500
            text-white
            hover:bg-red-600
          "
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {preview ? "Change" : "Choose"}
        </Button>

        {preview && (
          <>
            <Button
              variant="outline"
              className="
                rounded-full
                border-[var(--border)]
                bg-[var(--card)]
                hover:border-red-500
                hover:bg-red-50
                hover:text-red-500
              "
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Replace
            </Button>

            <Button
              variant="destructive"
              className="rounded-full"
              onClick={() => {
                setThumbnail(null);

                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-red-50 p-4">
        <h3 className="font-semibold text-red-600">
          Thumbnail Tips
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>• Recommended size: 1280 × 720 px</li>
          <li>• Aspect ratio: 16:9</li>
          <li>• Maximum size: 2 MB</li>
          <li>• Use bright, high-quality images</li>
        </ul>
      </div>
    </section>
  );
}