"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";

import {
  Home,
  PlaySquare,
  History,
  Heart,
  Clock3,
  Download,
  UserCircle2,
  PartyPopper,
} from "lucide-react";

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);

  const {
    isOpen,
    isMobileOpen,
    closeMobileSidebar,
  } = useSidebar();

  const pathname = usePathname();

  const menuItems = [
    {
      name: "Home",
      icon: Home,
      href: "/",
    },
    {
      name: "Subscriptions",
      icon: PlaySquare,
      href: "/subscriptions",
    },
  ];

  const libraryItems = [
    {
      name: "History",
      icon: History,
      href: "/history",
    },
    {
      name: "Favorites",
      icon: Heart,
      href: "/favorites",
    },
    {
      name: "Watch Later",
      icon: Clock3,
      href: "/watch-later",
    },
    {
      name: "Join Watch Party",
      icon: PartyPopper,
      href: "/watch-party",
    },
    {
      name: "Downloads",
      icon: Download,
      href: "/downloads",
    },
    {
      name: user?.hasChannel
        ? "My Channel"
        : "Create Channel",
      icon: UserCircle2,
      href: user?.hasChannel
        ? "/channel/me"
        : "/channel/create",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={closeMobileSidebar}
        className={`
          fixed inset-0 z-30
          bg-black/50
          backdrop-blur-sm
          md:hidden
          transition-opacity
          duration-300
          ease-in-out
          ${
            isMobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-16
          z-40

          h-[calc(100vh-4rem)]
          w-64

          overflow-y-auto
          overflow-x-hidden

          border-r
          border-border
          bg-background

          md:sticky

          transform
          transition-transform
          transition-[width]
          duration-300
          ease-[cubic-bezier(0.4,0,0.2,1)]

          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }

          md:transition-[width]
          ${
            isOpen
              ? "md:w-64"
              : "md:w-20"
          }
        `}
      >
        <nav className="space-y-1 p-2">
          {/* Main Menu */}
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileSidebar}
              >
                <Button
                  variant="ghost"
                  className={`
                    h-12
                    w-full
                    rounded-xl
                    transition-colors
                    duration-200

                    ${
                      isActive
                        ? "bg-red-100 text-red-500"
                        : "hover:bg-red-50 hover:text-red-500"
                    }

                    ${
                      isOpen
                        ? "justify-start px-4"
                        : "justify-center px-0"
                    }
                  `}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span
                    className={`
                      overflow-hidden
                      whitespace-nowrap
                      transition-all
                      duration-300
                      ease-in-out

                      ${
                        isOpen
                          ? "ml-3 w-auto opacity-100"
                          : "ml-0 w-0 opacity-0"
                      }
                    `}
                  >
                    {item.name}
                  </span>
                </Button>
              </Link>
            );
          })}

          {/* Library */}
          {user && (
            <>
              <hr className="my-3 border-border" />

              <div
                className={`
                  overflow-hidden
                  px-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                  transition-all
                  duration-300
                  ease-in-out

                  ${
                    isOpen
                      ? "max-h-10 pb-2 opacity-100"
                      : "max-h-0 pb-0 opacity-0"
                  }
                `}
              >
                Library
              </div>

              {libraryItems.map((item) => {
                const Icon = item.icon;

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileSidebar}
                  >
                    <Button
                      variant="ghost"
                      className={`
                        h-12
                        w-full
                        rounded-xl
                        text-foreground
                        transition-colors
                        duration-200

                        ${
                          isActive
                            ? "bg-red-100 text-red-500"
                            : "hover:bg-red-50 hover:text-red-500"
                        }

                        ${
                          isOpen
                            ? "justify-start px-4"
                            : "justify-center px-0"
                        }
                      `}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>

                      <span
                        className={`
                          overflow-hidden
                          whitespace-nowrap
                          transition-all
                          duration-300
                          ease-in-out

                          ${
                            isOpen
                              ? "ml-3 w-auto opacity-100"
                              : "ml-0 w-0 opacity-0"
                          }
                        `}
                      >
                        {item.name}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;