"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

type ProfileAvatarProps = {
  avatar: File | null;
  setAvatar: React.Dispatch<React.SetStateAction<File | null>>;
  initialAvatar: string;
};

export default function ProfileAvatar({
  avatar,
  setAvatar,
  initialAvatar,
}: ProfileAvatarProps) {
  const image = avatar
    ? URL.createObjectURL(avatar)
    : initialAvatar;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        Profile Picture
      </h2>

      <div className="flex items-center gap-6">
        <Image
          src={image}
          alt="Profile"
          width={110}
          height={110}
          className="h-28 w-28 rounded-full border border-border object-cover"
        />

        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-white transition hover:bg-red-600">
            <Camera className="h-5 w-5" />

            Change Photo

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setAvatar(e.target.files[0]);
                }
              }}
            />
          </label>

          <p className="mt-3 text-sm text-muted-foreground">
            JPG, PNG or WEBP up to 5 MB.
          </p>
        </div>
      </div>
    </div>
  );
}