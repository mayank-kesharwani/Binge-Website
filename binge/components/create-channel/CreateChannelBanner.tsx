"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";

type Props = {
  banner: File | null;
  setBanner: React.Dispatch<
    React.SetStateAction<File | null>
  >;

  initialBanner?: string;
};

export default function CreateChannelBanner({
  banner,
  setBanner,
  initialBanner,
}: Props) {
  const preview = banner
    ? URL.createObjectURL(banner)
    : initialBanner?.trim() || null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setBanner(file);
  };

  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Channel Banner
      </h3>

      <label
        htmlFor="banner-upload"
        className="
          group
          flex
          h-64
          w-full
          cursor-pointer
          items-center
          justify-center
          overflow-hidden
          rounded-3xl
          border-2
          border-dashed
          border-border
          bg-muted/30
          transition-all
          duration-300
          hover:border-red-500
          hover:bg-red-50
          dark:hover:bg-red-950/20
        "
      >
        {preview ? (
          <Image
            src={preview}
            alt="Banner Preview"
            width={1600}
            height={400}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div className="text-center">
            <ImagePlus className="mx-auto mb-4 h-14 w-14 text-red-500" />

            <h4 className="text-lg font-semibold text-foreground">
              Upload Banner
            </h4>

            <p className="mt-2 text-sm text-muted-foreground">
              Recommended size: 2048 × 1152 px
            </p>

            <p className="mt-1 text-xs text-muted-foreground/70">
              JPG, PNG or WEBP
            </p>
          </div>
        )}
      </label>

      <input
        id="banner-upload"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </section>
  );
}