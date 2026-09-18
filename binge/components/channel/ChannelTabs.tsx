"use client";

import {
  Video,
  Clapperboard,
  ListVideo,
  Users,
  Info,
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: React.Dispatch<
    React.SetStateAction<string>
  >;
};

const tabs = [
  {
    id: "videos",
    label: "Videos",
    icon: Video,
  },
  {
    id: "shorts",
    label: "Shorts",
    icon: Clapperboard,
  },
  {
    id: "playlists",
    label: "Playlists",
    icon: ListVideo,
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
  },
  {
    id: "about",
    label: "About",
    icon: Info,
  },
];

export default function ChannelTabs({
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <section className="mt-10 border-b border-gray-200">
      <nav
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        aria-label="Channel navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              aria-current={
                isActive ? "page" : undefined
              }
              className={`
                relative
                flex
                shrink-0
                items-center
                gap-2
                px-5
                py-4
                text-sm
                font-semibold
                transition-all
                duration-300
                ${
                  isActive
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-500"
                }
              `}
            >
              <Icon className="h-5 w-5" />

              <span>{tab.label}</span>

              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-full
                  bg-red-500
                  transition-transform
                  duration-300
                  ${
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0"
                  }
                `}
              />
            </button>
          );
        })}
      </nav>
    </section>
  );
}