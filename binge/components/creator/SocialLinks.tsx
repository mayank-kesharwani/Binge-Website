"use client";

import type { ChannelForm } from "@/types/channel";

type Props = {
  form: ChannelForm;
  setForm: React.Dispatch<React.SetStateAction<ChannelForm>>;
};

const fields: {
  key: keyof Pick<
    ChannelForm,
    "website" | "github" | "linkedin" | "instagram" | "twitter"
  >;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/username",
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    placeholder: "https://x.com/username",
  },
];

export default function SocialLinks({
  form,
  setForm,
}: Props) {
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
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        Social Links
      </h2>

      <div className="grid gap-5">
        {fields.map((field) => (
          <div key={field.key}>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-foreground
              "
            >
              {field.label}
            </label>

            <input
              type="url"
              value={form[field.key]}
              placeholder={field.placeholder}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  [field.key]: e.target.value,
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
        ))}
      </div>
    </section>
  );
}