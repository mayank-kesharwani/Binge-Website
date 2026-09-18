"use client";

import {
  FileText,
  FolderOpen,
  Hash,
  AlertCircle,
} from "lucide-react";

import type { UploadForm } from "@/types/upload";

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 5000;

const categories = [
  "Technology",
  "Programming",
  "AI",
  "Gaming",
  "Music",
  "Education",
  "Travel",
  "Sports",
  "Comedy",
  "News",
  "Movies",
  "Podcasts",
  "Lifestyle",
];

type Props = {
  form: UploadForm;
  setForm: React.Dispatch<
    React.SetStateAction<UploadForm>
  >;
};

export default function UploadDetails({
  form,
  setForm,
}: Props) {
  const updateField = <K extends keyof UploadForm>(
    key: K,
    value: UploadForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <section
      className="
        rounded-3xl
        border border-border
        bg-background
        p-6
        shadow-sm
      "
    >
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">
          Video Details
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add information to help viewers discover your
          video.
        </p>
      </div>

      <div className="space-y-6">

        {/* Title */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="h-4 w-4 text-red-500" />
              Title
            </label>

            <span
              className={`text-xs ${
                form.title.length > 90
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {form.title.length}/{MAX_TITLE}
            </span>
          </div>

          <input
            type="text"
            placeholder="Enter an engaging title..."
            maxLength={MAX_TITLE}
            value={form.title}
            onChange={(e) =>
              updateField("title", e.target.value)
            }
            className="
              h-12
              w-full
              rounded-xl
              border border-border
              bg-background
              px-4
              text-foreground
              outline-none
              transition-all
              placeholder:text-muted-foreground
              focus:border-red-500
              focus:ring-2
              focus:ring-red-100
            "
          />
        </div>

        {/* Description */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="h-4 w-4 text-red-500" />
              Description
            </label>

            <span
              className={`text-xs ${
                form.description.length > 4500
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {form.description.length}/{MAX_DESCRIPTION}
            </span>
          </div>

          <textarea
            rows={8}
            maxLength={MAX_DESCRIPTION}
            placeholder="Tell viewers about your video..."
            value={form.description}
            onChange={(e) =>
              updateField(
                "description",
                e.target.value
              )
            }
            className="
              w-full
              resize-none
              rounded-xl
              border border-border
              bg-background
              p-4
              text-foreground
              outline-none
              transition-all
              placeholder:text-muted-foreground
              focus:border-red-500
              focus:ring-2
              focus:ring-red-100
            "
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <FolderOpen className="h-4 w-4 text-red-500" />
            Category
          </label>

          <select
            value={form.category}
            onChange={(e) =>
              updateField("category", e.target.value)
            }
            className="
              h-12
              w-full
              rounded-xl
              border border-border
              bg-background
              px-4
              text-foreground
              outline-none
              transition-all
              focus:border-red-500
              focus:ring-2
              focus:ring-red-100
            "
          >
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Playlist */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <Hash className="h-4 w-4 text-red-500" />
            Playlist
          </label>

          <input
            type="text"
            placeholder="Optional playlist name..."
            className="
              h-12
              w-full
              rounded-xl
              border border-border
              bg-background
              px-4
              text-foreground
              outline-none
              transition-all
              placeholder:text-muted-foreground
              focus:border-red-500
              focus:ring-2
              focus:ring-red-100
            "
          />
        </div>

        {/* Tips */}
        <div
          className="
            rounded-2xl
            border border-red-100
            bg-red-50
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

            <div>
              <h3 className="font-semibold text-red-600">
                Tips for better discoverability
              </h3>

              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>
                  • Keep your title under 70 characters.
                </li>
                <li>
                  • Use relevant keywords naturally.
                </li>
                <li>
                  • Add a detailed description.
                </li>
                <li>
                  • Choose the correct category.
                </li>
                <li>
                  • Organize videos into playlists.
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}