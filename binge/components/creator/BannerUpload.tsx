"use client";

import Image from "next/image";

type Props = {
  banner: File | null;
  setBanner: (file: File | null) => void;
  initialBanner?: string;
};

export default function BannerUpload({
  banner,
  setBanner,
  initialBanner,
}: Props) {
  const preview = banner
    ? URL.createObjectURL(banner)
    : initialBanner?.trim() || null;

  return (
    <section
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-6
        text-card-foreground
        shadow-sm

        dark:shadow-none
      "
    >
      {/* Header */}
      <h2 className="text-lg font-semibold text-foreground">
        Channel Banner
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Recommended size: 2048 × 1152
      </p>

      {/* Upload */}
      <label className="mt-5 block cursor-pointer">
        <div
          className="
            relative
            overflow-hidden
            rounded-xl
            border
            border-dashed
            border-border
            bg-background
            transition
            duration-300

            hover:border-red-500
            hover:bg-red-50/30

            dark:hover:bg-red-950/20
          "
        >
          {preview ? (
            <Image
              src={preview}
              alt="Channel Banner"
              width={1200}
              height={320}
              className="
                h-56
                w-full
                object-cover
                transition-transform
                duration-500
                hover:scale-[1.02]
              "
            />
          ) : (
            <div
              className="
                flex
                h-56
                items-center
                justify-center
                bg-background
              "
            >
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Upload Banner
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) =>
            setBanner(e.target.files?.[0] || null)
          }
        />
      </label>
    </section>
  );
}