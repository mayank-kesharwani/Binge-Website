"use client";

import Link from "next/link";
import {
  CalendarDays,
  Eye,
  Film,
  Globe,
} from "lucide-react";

import { format } from "date-fns";
import formatViews from "@/lib/formatViews";

type ChannelAboutProps = {
  channel: {
    description: string;
    createdAt: string;
    totalViews: number;
    totalVideos: number;

    website?: string;

    github?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
};

export default function ChannelAbout({
  channel,
}: ChannelAboutProps) {
  return (
    <section
      className="
        mt-8
        rounded-3xl
        border
        border-border
        bg-background
        p-8
        shadow-sm
      "
    >
      {/* Heading */}
      <h2 className="mb-8 text-3xl font-bold text-foreground">
        About
      </h2>

      {/* Description */}
      <div className="rounded-2xl bg-muted p-6">
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Description
        </h3>

        <p className="leading-8 text-foreground/80">
          {channel.description ||
            "This creator hasn't added a description yet."}
        </p>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {/* Website */}
        <div
          className="
            flex
            items-center
            gap-4
            rounded-2xl
            bg-muted
            p-5
            transition
            hover:bg-red-50
          "
        >
          <Globe className="h-6 w-6 text-red-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Website
            </p>

            {channel.website ? (
              <Link
                href={channel.website}
                target="_blank"
                className="font-medium text-red-500 hover:underline"
              >
                {channel.website}
              </Link>
            ) : (
              <p className="font-medium text-muted-foreground">
                Not provided
              </p>
            )}
          </div>
        </div>

        {/* Joined */}
        <div
          className="
            group
            flex
            items-center
            gap-4
            rounded-2xl
            bg-muted
            p-5
            transition
            hover:bg-red-50
          "
        >
          <CalendarDays className="h-6 w-6 text-red-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Joined
            </p>

            <p className="font-medium text-foreground group-hover:text-black">
              {channel.createdAt
                ? format(
                    new Date(channel.createdAt),
                    "dd MMM yyyy"
                  )
                : "Unknown"}
            </p>
          </div>
        </div>

        {/* Views */}
        <div
          className="
            group
            flex
            items-center
            gap-4
            rounded-2xl
            bg-muted
            p-5
            transition
            hover:bg-red-50
          "
        >
          <Eye className="h-6 w-6 text-red-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Total Views
            </p>

            <p className="font-medium text-foreground group-hover:text-black">
              {formatViews(channel.totalViews || 0)}
            </p>
          </div>
        </div>

        {/* Videos */}
        <div
          className="
            group
            flex
            items-center
            gap-4
            rounded-2xl
            bg-muted
            p-5
            transition
            hover:bg-red-50
          "
        >
          <Film className="h-6 w-6 text-red-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Videos
            </p>

            <p className="font-medium text-foreground group-hover:text-black">
              {channel.totalVideos || 0}
            </p>
          </div>
        </div>

      </div>

      {/* Social Links */}
      {(channel.github ||
        channel.linkedin ||
        channel.instagram ||
        channel.twitter) && (
        <div className="mt-10">
          <h3 className="mb-5 text-xl font-semibold text-foreground">
            Social Links
          </h3>

          <div className="grid gap-4">

            {channel.github && (
              <Link
                href={channel.github}
                target="_blank"
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background
                  p-4
                  text-foreground
                  transition
                  hover:border-red-500
                  hover:bg-red-50/40
                "
              >
                GitHub
              </Link>
            )}

            {channel.linkedin && (
              <Link
                href={channel.linkedin}
                target="_blank"
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background
                  p-4
                  text-foreground
                  transition
                  hover:border-red-500
                  hover:bg-red-50/40
                "
              >
                LinkedIn
              </Link>
            )}

            {channel.instagram && (
              <Link
                href={channel.instagram}
                target="_blank"
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background
                  p-4
                  text-foreground
                  transition
                  hover:border-red-500
                  hover:bg-red-50/40
                "
              >
                Instagram
              </Link>
            )}

            {channel.twitter && (
              <Link
                href={channel.twitter}
                target="_blank"
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background
                  p-4
                  text-foreground
                  transition
                  hover:border-red-500
                  hover:bg-red-50/40
                "
              >
                X (Twitter)
              </Link>
            )}

          </div>
        </div>
      )}
    </section>
  );
}