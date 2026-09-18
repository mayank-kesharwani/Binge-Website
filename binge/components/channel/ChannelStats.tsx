"use client";

import {
  Users,
  Video,
  Eye,
  CalendarDays,
} from "lucide-react";

import formatViews from "@/lib/formatViews";
import { format } from "date-fns";

type ChannelStatsProps = {
  channel: {
    subscribers: number;
    totalVideos: number;
    totalViews: number;
    createdAt: string;
  };
};

export default function ChannelStats({
  channel,
}: ChannelStatsProps) {
  const stats = [
    {
      title: "Subscribers",
      value: formatViews(channel.subscribers ?? 0),
      icon: Users,
    },
    {
      title: "Videos",
      value: channel.totalVideos ?? 0,
      icon: Video,
    },
    {
      title: "Total Views",
      value: formatViews(channel.totalViews ?? 0),
      icon: Eye,
    },
    {
      title: "Joined",
      value: format(
        new Date(channel.createdAt),
        "MMM yyyy"
      ),
      icon: CalendarDays,
    },
  ];

  return (
    <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              group
              rounded-2xl
              border
              border-border
              bg-card
              p-6
              text-card-foreground
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-red-300
              hover:shadow-lg
              dark:hover:border-red-800
            "
          >
            <div className="flex items-center justify-between">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  transition-colors
                  duration-300
                  group-hover:bg-red-500
                  dark:bg-red-950/30
                  dark:group-hover:bg-red-500
                "
              >
                <Icon
                  className="
                    h-7
                    w-7
                    text-red-500
                    transition-colors
                    duration-300
                    group-hover:text-white
                  "
                />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-foreground">
              {stat.value}
            </h2>
          </div>
        );
      })}
    </section>
  );
}