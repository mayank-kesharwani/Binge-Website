"use client";

import Image from "next/image";
import { toast } from "sonner";

import type { ChannelForm } from "@/types/channel";

type Props = {
  avatar: File | null;
  setAvatar: (file: File | null) => void;

  initialAvatar?: string;

  form: ChannelForm;

  setForm: React.Dispatch<
    React.SetStateAction<ChannelForm>
  >;
};

export default function ChannelProfile({
  avatar,
  setAvatar,
  initialAvatar,
  form,
  setForm,
}: Props) {
  const preview = avatar
    ? URL.createObjectURL(avatar)
    : initialAvatar?.trim() ||
      "https://placehold.co/160x160/png";

  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Avatar size must be less than 5 MB."
      );
      return;
    }

    setAvatar(file);
  };

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
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        Channel Profile
      </h2>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <label className="group cursor-pointer">
            <Image
              src={preview}
              alt="Channel Avatar"
              width={160}
              height={160}
              className="
                h-40
                w-40
                rounded-full
                border
                border-border
                object-cover
                shadow-sm
                transition
                duration-300
                group-hover:scale-[1.02]
                group-hover:opacity-90
              "
            />

            <input
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
            />
          </label>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            Click to change avatar
            <br />
            JPG, PNG or WebP (Max 5 MB)
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-6">
          {/* Channel Name */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Channel Name
              </label>

              <span
                className={`text-xs ${
                  form.channelName.length > 90
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {form.channelName.length}/100
              </span>
            </div>

            <input
              type="text"
              maxLength={100}
              value={form.channelName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  channelName: e.target.value,
                }))
              }
              className="
                h-12
                w-full
                rounded-xl
                border
                border-border
                bg-background
                px-4
                text-foreground
                outline-none
                transition

                placeholder:text-muted-foreground

                focus:border-red-500
                focus:ring-2
                focus:ring-red-100

                dark:focus:ring-red-950/40
              "
            />
          </div>

          {/* Handle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Handle
            </label>

            <input
              type="text"
              value={form.handle}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  handle: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, ""),
                }))
              }
              className="
                h-12
                w-full
                rounded-xl
                border
                border-border
                bg-background
                px-4
                text-foreground
                outline-none
                transition

                placeholder:text-muted-foreground

                focus:border-red-500
                focus:ring-2
                focus:ring-red-100

                dark:focus:ring-red-950/40
              "
            />

            <p className="mt-2 text-sm text-muted-foreground">
              binge.com/@{form.handle}
            </p>
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>

              <span
                className={`text-xs ${
                  form.description.length > 950
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {form.description.length}/1000
              </span>
            </div>

            <textarea
              rows={5}
              maxLength={1000}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="
                w-full
                rounded-xl
                border
                border-border
                bg-background
                p-4
                text-foreground
                outline-none
                transition

                placeholder:text-muted-foreground

                focus:border-red-500
                focus:ring-2
                focus:ring-red-100

                dark:focus:ring-red-950/40
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}