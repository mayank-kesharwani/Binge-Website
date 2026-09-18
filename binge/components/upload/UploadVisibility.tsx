"use client";

import {
  Globe,
  Lock,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import type { UploadForm } from "@/types/upload";

const options = [
  {
    value: "public",
    title: "Public",
    description: "Everyone can watch your video.",
    icon: Globe,
  },
  {
    value: "unlisted",
    title: "Unlisted",
    description: "Only people with the link can watch.",
    icon: EyeOff,
  },
  {
    value: "private",
    title: "Private",
    description: "Only you can watch this video.",
    icon: Lock,
  },
];

type Props = {
  form: UploadForm;
  setForm: React.Dispatch<
    React.SetStateAction<UploadForm>
  >;
};

export default function UploadVisibility({
  form,
  setForm,
}: Props) {
  const updateVisibility = (
    visibility: UploadForm["visibility"]
  ) => {
    setForm((prev) => ({
      ...prev,
      visibility,
    }));
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
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-5 w-5 text-red-500" />
          Visibility
        </h2>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Choose who can view your uploaded video.
        </p>
      </div>

      <div className="space-y-4">
        {options.map((item) => {
          const Icon = item.icon;
          const active = form.visibility === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                updateVisibility(
                  item.value as UploadForm["visibility"]
                )
              }
              className={`
                flex
                w-full
                items-center
                gap-4
                rounded-2xl
                border
                p-5
                text-left
                transition-all
                duration-300

                ${
                  active
                    ? "border-red-500"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-red-300 hover:bg-red-50/40"
                }
              `}
            >
              <div
                className={`
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full

                  ${
                    active
                      ? "bg-red-500 text-white"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }
                `}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>

              <div
                className={`
                  h-5
                  w-5
                  rounded-full
                  border-2

                  ${
                    active
                      ? "border-red-500 bg-red-500"
                      : "border-[var(--border)]"
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-red-50 p-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          🔒 You can change your video's visibility at any
          time after publishing.
        </p>
      </div>
    </section>
  );
}