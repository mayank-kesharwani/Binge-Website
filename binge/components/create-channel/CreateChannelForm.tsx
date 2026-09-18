"use client";

import {
  UserRound,
  AtSign,
  FileText,
} from "lucide-react";

type Props = {
  form: {
    channelName: string;
    handle: string;
    description: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      channelName: string;
      handle: string;
      description: string;
    }>
  >;
};

export default function CreateChannelForm({
  form,
  setForm,
}: Props) {
  return (
    <section className="rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <h2 className="mb-8 text-2xl font-bold text-foreground">
        Channel Information
      </h2>

      {/* Channel Name */}
      <div className="mb-7">
        <label className="mb-2 flex items-center gap-2 font-semibold text-foreground">
          <UserRound className="h-4 w-4 text-red-500" />
          Channel Name
        </label>

        <input
          type="text"
          value={form.channelName}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              channelName: e.target.value,
            }))
          }
          placeholder="Enter your channel name"
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
            transition-all
            duration-300
            placeholder:text-muted-foreground
            focus:border-red-500
            focus:ring-2
            focus:ring-red-100
            dark:focus:ring-red-950/40
          "
        />

        <p className="mt-2 text-sm text-muted-foreground">
          This is the name viewers will see.
        </p>
      </div>

      {/* Handle */}
      <div className="mb-7">
        <label className="mb-2 flex items-center gap-2 font-semibold text-foreground">
          <AtSign className="h-4 w-4 text-red-500" />
          Channel Handle
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
          placeholder="@yourchannel"
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
            transition-all
            duration-300
            placeholder:text-muted-foreground
            focus:border-red-500
            focus:ring-2
            focus:ring-red-100
            dark:focus:ring-red-950/40
          "
        />

        <p className="mt-2 text-sm text-muted-foreground">
          Your unique Binge handle.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 flex items-center gap-2 font-semibold text-foreground">
          <FileText className="h-4 w-4 text-red-500" />
          Description
        </label>

        <textarea
          rows={6}
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="Tell viewers what your channel is about..."
          className="
            w-full
            rounded-xl
            border
            border-border
            bg-background
            p-4
            text-foreground
            outline-none
            transition-all
            duration-300
            placeholder:text-muted-foreground
            focus:border-red-500
            focus:ring-2
            focus:ring-red-100
            dark:focus:ring-red-950/40
          "
        />

        <p className="mt-2 text-sm text-muted-foreground">
          Help viewers understand what content you create.
        </p>
      </div>
    </section>
  );
}