"use client";

import { useState } from "react";
import { Tags, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadForm } from "@/types/upload";

const categorySuggestions: Record<string, string[]> = {
  Technology: ["Technology", "Tech", "Innovation", "Gadgets", "Future"],

  Programming: [
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express",
    "MongoDB",
    "MERN",
    "Coding",
    "Tutorial",
  ],

  AI: [
    "AI",
    "ChatGPT",
    "OpenAI",
    "Machine Learning",
    "Deep Learning",
    "Python",
    "LLM",
    "Generative AI",
  ],

  Gaming: [
    "Gaming",
    "Gameplay",
    "BGMI",
    "PUBG",
    "Valorant",
    "Minecraft",
    "PC Gaming",
    "Live Stream",
  ],

  Music: [
    "Music",
    "Song",
    "Cover",
    "Live",
    "Instrumental",
    "Acoustic",
  ],

  Education: [
    "Education",
    "Learning",
    "Tutorial",
    "Course",
    "Study",
    "Exam",
  ],

  Travel: [
    "Travel",
    "Vlog",
    "Adventure",
    "Trip",
    "Tourism",
    "Vacation",
  ],

  Sports: [
    "Sports",
    "Football",
    "Cricket",
    "Fitness",
    "Workout",
    "Highlights",
  ],

  Comedy: [
    "Comedy",
    "Funny",
    "Meme",
    "Stand-up",
    "Entertainment",
  ],

  News: [
    "News",
    "Breaking",
    "Politics",
    "Current Affairs",
    "World News",
  ],

  Movies: [
    "Movies",
    "Trailer",
    "Review",
    "Cinema",
    "Hollywood",
    "Bollywood",
  ],

  Podcasts: [
    "Podcast",
    "Interview",
    "Discussion",
    "Talk Show",
    "Business",
  ],

  Lifestyle: [
    "Lifestyle",
    "Daily Routine",
    "Fashion",
    "Health",
    "Food",
    "Self Improvement",
  ],
};

type Props = {
  form: UploadForm;
  setForm: React.Dispatch<React.SetStateAction<UploadForm>>;
};

export default function UploadTags({
  form,
  setForm,
}: Props) {
  const [input, setInput] = useState("");

  const suggestions =
    categorySuggestions[form.category] || [];

  const addTag = () => {
    const value = input.trim();

    if (!value) return;

    if (form.tags.includes(value)) return;

    if (form.tags.length >= 10) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, value],
    }));

    setInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addSuggestedTag = (tag: string) => {
    if (form.tags.length >= 10) return;
    if (form.tags.includes(tag)) return;

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
  };

  return (
    <section
      className="
        rounded-3xl
        border
        border-border
        bg-background
        p-6
        shadow-sm
      "
    >
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Tags className="h-5 w-5 text-red-500" />
          Tags
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add keywords to help viewers discover your video.
        </p>
      </div>

      {/* Add Tag */}

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add a tag..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="
            h-11
            flex-1
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
          "
        />

        <Button
          onClick={addTag}
          disabled={form.tags.length >= 10}
          className="
            rounded-xl
            bg-red-500
            text-white
            hover:bg-red-600
          "
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Selected Tags */}

      <div className="mt-6 flex flex-wrap gap-3">
        {form.tags.map((tag) => (
          <div
            key={tag}
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-red-50
              px-4
              py-2
              text-sm
              font-medium
              text-red-600
              transition
              hover:bg-red-100
            "
          >
            {tag}

            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="
                rounded-full
                p-1
                transition
                hover:bg-red-200
              "
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Suggested Tags */}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Suggested Tags
          </h3>

          <span className="text-xs text-muted-foreground">
            Based on {form.category || "category"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => {
            const selected = form.tags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                disabled={selected || form.tags.length >= 10}
                onClick={() => addSuggestedTag(tag)}
                className={`
                  rounded-full
                  border
                  px-4
                  py-2
                  text-sm
                  transition-all

                  ${
                    selected
                      ? "cursor-default border-red-500 bg-red-500 text-white"
                      : "border-border bg-background text-foreground hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                  }
                `}
              >
                {selected ? "✓ " : "+ "}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip */}

      <div className="mt-6 rounded-2xl bg-muted p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            💡 Use 5–10 relevant tags to improve discoverability.
          </p>

          <span className="shrink-0 font-medium text-muted-foreground">
            {form.tags.length}/10
          </span>
        </div>
      </div>
    </section>
  );
}