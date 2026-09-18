"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

type Props = {
  avatar: File | null;
  setAvatar: React.Dispatch<
    React.SetStateAction<File | null>
  >;

  initialAvatar?: string;
};

export default function CreateChannelAvatar({
  avatar,
  setAvatar,
  initialAvatar,
}: Props) {
  const preview = avatar
    ? URL.createObjectURL(avatar)
    : initialAvatar?.trim() ||
      "https://i.pravatar.cc/200?img=12";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatar(file);
  };

  return (
    <section className="flex flex-col items-center">
      <div className="relative">
        <Image
          src={preview}
          alt="Channel Avatar"
          width={140}
          height={140}
          className="
            rounded-full
            border-4
            border-red-100
            object-cover
            shadow-md
            dark:border-red-950
          "
        />

        <label
          htmlFor="avatar-upload"
          className="
            absolute
            bottom-2
            right-2
            flex
            h-11
            w-11
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-red-500
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:scale-110
            hover:bg-red-600
          "
        >
          <Camera className="h-5 w-5" />
        </label>

        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
        Channel Profile Picture
      </h3>

      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Upload a profile picture that represents your
        channel.
      </p>
    </section>
  );
}