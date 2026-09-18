"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const categories = [
  "All",
  "Music",
  "Gaming",
  "News",
  "Sports",
  "AI",
  "Programming",
  "Movies",
  "Podcasts",
  "Education",
  "Travel",
  "Technology",
  "Comedy",
  "Live",
  "Trending",
];

const CategoryTabs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory =
    searchParams.get("category") || "All";

  const [activeCategory, setActiveCategory] =
    useState(currentCategory);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const handleCategoryChange = (
    category: string,
  ) => {
    setActiveCategory(category);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/?${queryString}`
        : "/",
    );
  };

  const scroll = (
    direction: "left" | "right",
  ) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        direction === "left"
          ? -300
          : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full border-b border-border bg-background">
      <div className="relative overflow-hidden">
        {/* Left Fade */}

        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-background to-transparent" />

        {/* Left Arrow */}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="
            absolute left-2 top-1/2 z-20
            hidden -translate-y-1/2
            rounded-full
            bg-background
            shadow
            hover:bg-muted
            md:flex
          "
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Categories */}

        <div
          ref={scrollRef}
          className="
            flex
            items-center
            gap-3
            overflow-x-auto
            overflow-y-hidden
            whitespace-nowrap
            px-4
            py-2
            md:px-12
            scrollbar-hide
            scroll-smooth
            overscroll-x-contain
          "
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              onClick={() =>
                handleCategoryChange(
                  category,
                )
              }
              className={`
                shrink-0
                rounded-full
                border
                px-5
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  activeCategory ===
                  category
                    ? "border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                    : "border-border bg-muted text-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                }
              `}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Right Arrow */}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="
            absolute right-2 top-1/2 z-20
            hidden -translate-y-1/2
            rounded-full
            bg-background
            shadow
            hover:bg-muted
            md:flex
          "
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Right Fade */}

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
};

export default CategoryTabs;