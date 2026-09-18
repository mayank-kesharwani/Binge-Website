"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import SearchSuggestions from "@/components/search/SearchSuggestions";
import { useAuthStore } from "@/store/authStore";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "@/services/notification.service";

import { getMyMembership } from "@/services/membership.service";

import type { Notification } from "@/types/notification";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Menu,
  Search,
  Mic,
  Bell,
  User,
  Video,
  History,
  Heart,
  Clock3,
  Home,
  LogOut,
  Settings,
  Check,
  Trash2,
  Download,
  Crown,
  X,
} from "lucide-react";

type SpeechRecognitionEventLike = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const Header = () => {
  const { user, logout, setUser } = useAuthStore();
  const { toggleSidebar } = useSidebar();

  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceError, setVoiceError] = useState("");

  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /* --------------------------------
     Membership
  -------------------------------- */

  const refreshMembership = async () => {
    if (!user?._id) return;

    try {
      const response = await getMyMembership();

      const membership = response?.data?.membership ?? response?.data ?? null;

      if (!membership?.plan) return;

      setUser({
        membership: {
          plan: membership.plan,
          status: membership.status,
          startDate: membership.startDate ?? null,
          endDate: membership.endDate ?? null,
          lastPaymentId: membership.lastPaymentId ?? "",
          razorpayCustomerId: membership.razorpayCustomerId ?? "",
        },
      });
    } catch (error) {
      console.error("Failed to refresh membership:", error);
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    refreshMembership();

    const handleMembershipUpdated = () => {
      refreshMembership();
    };

    const handleWindowFocus = () => {
      refreshMembership();
    };

    window.addEventListener("membership-updated", handleMembershipUpdated);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("membership-updated", handleMembershipUpdated);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [user?._id, pathname]);

  const membershipPlan = user?.membership?.plan ?? "free";

  const isPremiumUser =
    membershipPlan !== "free" &&
    user?.membership?.status === "active" &&
    (!user?.membership?.endDate ||
      new Date(user.membership.endDate) > new Date());

  /* --------------------------------
     Search
  -------------------------------- */

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);

    setSearchQuery("");
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  };

  const handleVoiceSearch = (text: string) => {
    const query = text.trim();

    if (!query) return;

    setSearchQuery(query);
    setVoiceText(query);
    setShowVoiceSearch(false);
    setIsListening(false);

    router.push(`/search?q=${encodeURIComponent(query)}`);

    setTimeout(() => {
      setSearchQuery("");
      setVoiceText("");
    }, 300);
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);

    setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 0);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setShowSuggestions(false);
  };

  /* --------------------------------
     Voice Search
  -------------------------------- */

  const startVoiceSearch = () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceError(
        "Voice search is not supported in this browser. Please use Chrome or Edge.",
      );
      setShowVoiceSearch(true);
      return;
    }

    if (isListening) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore previous recognition cleanup errors.
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.lang =
      user?.preferences?.language === "hi" ? "hi-IN" : "en-IN";

    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
      setVoiceText("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < Object.keys(event.results).length; i++) {
        const result = event.results[i];

        if (result?.[0]?.transcript) {
          transcript += result[0].transcript;
        }
      }

      const text = transcript.trim();

      if (text) {
        setVoiceText(text);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setVoiceError(
          "Microphone permission was denied. Please allow microphone access and try again.",
        );
      } else if (event.error === "no-speech") {
        setVoiceError("No speech detected. Please try again.");
      } else {
        setVoiceError("Unable to recognize your voice. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    setShowVoiceSearch(true);
    recognition.start();
  };

  const closeVoiceSearch = () => {
    try {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort();
    } catch {
      // Ignore recognition cleanup errors.
    }

    recognitionRef.current = null;
    setIsListening(false);
    setVoiceError("");
    setVoiceText("");
    setShowVoiceSearch(false);
  };

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, []);

  useEffect(() => {
    if (showVoiceSearch && !isListening && voiceText.trim() && !voiceError) {
      const timer = setTimeout(() => {
        handleVoiceSearch(voiceText);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [showVoiceSearch, isListening, voiceText, voiceError]);

  /* --------------------------------
     Fetch Notifications
  -------------------------------- */

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);

        const response = await getNotifications();

        setNotifications(response.data ?? []);
        setUnreadCount(response.unreadCount ?? 0);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  /* --------------------------------
     Notification Actions
  -------------------------------- */

  const handleNotificationRead = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  read: true,
                }
              : item,
          ),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      if (notification.video?._id) {
        router.push(`/watch/${notification.video._id}`);
      } else if (notification.channel?.handle) {
        router.push(`/channel/${notification.channel.handle}`);
      }
    } catch (error) {
      console.error("Failed to handle notification:", error);
    }

    setShowNotifications(false);
  };

  const handleNotificationDelete = async (id: string) => {
    try {
      const notification = notifications.find((item) => item._id === id);

      await deleteNotification(id);

      setNotifications((prev) => prev.filter((item) => item._id !== id));

      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <>
      <header
        className="
          sticky top-0 z-50
          flex h-16 items-center justify-between
          border-b border-border
          bg-background
          px-3 sm:px-5
          shadow-sm
          transition-colors
        "
      >
        {/* =================================
            MOBILE + TABLET SEARCH OVERLAY
        ================================= */}

        {mobileSearchOpen && (
          <div
            className="
              absolute inset-0 z-[70]
              flex items-center gap-2
              bg-background
              px-3 sm:px-5
              lg:hidden
            "
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileSearch}
              className="h-10 w-10 shrink-0 rounded-full hover:bg-red-50"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="relative min-w-0 flex-1">
              <div className="flex h-11">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Search videos"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }

                    if (e.key === "Escape") {
                      closeMobileSearch();
                    }
                  }}
                  className="
                    min-w-0 flex-1
                    rounded-l-full
                    border border-r-0 border-input
                    bg-background
                    px-4
                    text-sm text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-100
                    sm:px-5
                  "
                />

                <Button
                  variant="outline"
                  onClick={handleSearch}
                  className="
                    h-11 w-12
                    shrink-0
                    rounded-l-none rounded-r-full
                    border border-input
                    bg-muted
                    text-foreground
                    hover:bg-red-50
                    sm:w-14
                  "
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              <SearchSuggestions
                query={searchQuery}
                onClose={() => setSearchQuery("")}
              />
            </div>
          </div>
        )}

        {/* =================================
            VOICE SEARCH DIALOG
        ================================= */}

        <Dialog
          open={showVoiceSearch}
          onOpenChange={(open) => {
            if (!open) {
              closeVoiceSearch();
            }
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl border-border bg-background p-6">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-semibold text-foreground">
                Voice Search
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground">
                {isListening
                  ? "Listening... speak what you want to search."
                  : voiceError
                    ? voiceError
                    : voiceText
                      ? "Searching for what you said..."
                      : "Tap the microphone and start speaking."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center py-5">
              <button
                type="button"
                onClick={startVoiceSearch}
                disabled={isListening}
                aria-label={isListening ? "Listening" : "Start voice search"}
                className={`
                  relative
                  flex h-20 w-20
                  items-center justify-center
                  rounded-full
                  transition-all duration-300
                  ${
                    isListening
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-muted text-foreground hover:bg-red-100 hover:text-red-500"
                  }
                `}
              >
                <Mic className="h-8 w-8" />

                {isListening && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-red-500 opacity-30" />
                    <span className="absolute -inset-2 animate-pulse rounded-full border border-red-300 opacity-50" />
                  </>
                )}
              </button>

              <div className="mt-5 min-h-12 w-full rounded-xl bg-muted px-4 py-3 text-center">
                {voiceText ? (
                  <p className="text-sm font-medium text-foreground">
                    &quot;{voiceText}&quot;
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isListening
                      ? "Listening for your voice..."
                      : "Your voice input will appear here"}
                  </p>
                )}
              </div>

              {voiceError && (
                <p className="mt-3 text-center text-xs text-red-500">
                  {voiceError}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={closeVoiceSearch}
                className="rounded-full border-border px-6"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* =================================
            LEFT
        ================================= */}

        <div
          className={`
            flex items-center gap-2 sm:gap-4
            ${mobileSearchOpen ? "invisible" : ""}
          `}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full hover:bg-red-50"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link
            href="/"
            className="group flex items-center gap-2 transition-all duration-300"
          >
            <Image
              src="/binge.png"
              alt="Binge"
              width={38}
              height={38}
              priority
              className="
                transition-all duration-300
                group-hover:scale-110
                group-hover:rotate-3
              "
            />

            <span
              className="
                hidden text-2xl font-black
                tracking-tight
                text-foreground
                transition-colors duration-300
                group-hover:text-red-500
                sm:block
              "
            >
              <span className="text-red-500">B</span>
              inge
            </span>
          </Link>
        </div>

        {/* =================================
            DESKTOP SEARCH
        ================================= */}

        <div
          className="
            hidden flex-1
            items-center justify-center
            gap-4 px-8 lg:flex
          "
        >
          <div className="relative w-full max-w-2xl">
            <div className="flex">
              <input
                type="text"
                placeholder="Search videos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }

                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                className="
                  h-11 w-full
                  rounded-l-full
                  border border-r-0 border-input
                  bg-background
                  px-5
                  text-sm text-foreground
                  outline-none
                  transition-all duration-300
                  placeholder:text-muted-foreground
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                "
              />

              <Button
                variant="outline"
                onClick={handleSearch}
                className="
                  h-11 w-16
                  rounded-l-none rounded-r-full
                  border border-input
                  bg-muted
                  text-foreground
                  hover:bg-red-50
                "
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <SearchSuggestions
              query={searchQuery}
              onClose={() => setSearchQuery("")}
            />
          </div>

          <Button
            type="button"
            size="icon"
            onClick={startVoiceSearch}
            className="
              h-11 w-11
              rounded-full
              border
              border-transparent
              bg-muted
              text-foreground
              hover:border-red-500
              hover:bg-muted
              hover:text-red-500
            "
            aria-label="Voice search"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </div>

        {/* =================================
            RIGHT
        ================================= */}

        <div
          className={`
            flex items-center gap-1 sm:gap-2
            ${mobileSearchOpen ? "invisible" : ""}
          `}
        >
          {/* =================================
              MOBILE + TABLET SEARCH
          ================================= */}

          <Button
            variant="ghost"
            size="icon"
            onClick={openMobileSearch}
            className="
              flex
              h-10 w-10
              rounded-full
              hover:bg-red-50
              lg:hidden
            "
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </Button>

          {/* =================================
              MOBILE + TABLET VOICE SEARCH
          ================================= */}

          <Button
            variant="ghost"
            size="icon"
            onClick={startVoiceSearch}
            className="
              flex
              h-10 w-10
              rounded-full
              hover:bg-red-50
              lg:hidden
            "
            aria-label="Voice search"
          >
            <Mic className="h-6 w-6" />
          </Button>

          {user ? (
            <>
              {/* Desktop Premium */}

              {!isPremiumUser && (
                <Link href="/settings/membership" className="hidden lg:block">
                  <Button
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      font-semibold
                      text-red-600
                      transition-all
                      duration-300
                      hover:scale-105
                      hover:bg-red-100
                    "
                  >
                    <Crown className="h-4 w-4" />
                    Get Binge Premium
                  </Button>
                </Link>
              )}

              {/* Desktop Upload */}

              <Link href={user.hasChannel ? "/upload" : "/channel/create"}>
                <Button
                  className={`
                    hidden
                    rounded-full
                    px-5
                    text-white
                    transition-all duration-300
                    lg:flex
                    ${
                      pathname === "/upload" || pathname === "/channel/create"
                        ? "bg-red-600"
                        : "bg-red-500 hover:scale-105 hover:bg-red-600"
                    }
                  `}
                >
                  <Video className="mr-2 h-5 w-5" />
                  Upload
                </Button>
              </Link>

              {/* Tablet Upload */}

              <Link href={user.hasChannel ? "/upload" : "/channel/create"}>
                <Button
                  size="icon"
                  className={`
                    hidden
                    rounded-full
                    text-white
                    transition-all duration-300
                    md:flex lg:hidden
                    ${
                      pathname === "/upload" || pathname === "/channel/create"
                        ? "bg-red-600"
                        : "bg-red-500 hover:scale-110 hover:bg-red-600"
                    }
                  `}
                >
                  <Video className="h-5 w-5" />
                </Button>
              </Link>

              {/* Notifications */}

              <div ref={notificationRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative rounded-full hover:bg-red-50"
                >
                  <Bell className="h-6 w-6" />

                  {unreadCount > 0 && (
                    <span
                      className="
                        absolute
                        -right-0.5
                        -top-0.5
                        flex
                        min-h-5
                        min-w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        px-1
                        text-[10px]
                        font-bold
                        text-white
                      "
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}

                {showNotifications && (
                  <div
                    className="
                      absolute right-0 top-12
                      z-[60]
                      w-[360px]
                      overflow-hidden
                      rounded-2xl
                      border border-border
                      bg-popover
                      text-popover-foreground
                      shadow-2xl
                    "
                  >
                    <div
                      className="
                        flex items-center
                        justify-between
                        border-b border-border
                        px-4 py-3
                      "
                    >
                      <div>
                        <h3 className="font-semibold">Notifications</h3>

                        {unreadCount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {unreadCount} unread
                          </p>
                        )}
                      </div>

                      <Link
                        href="/settings/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="
                          text-xs
                          font-medium
                          text-red-500
                          hover:text-red-600
                        "
                      >
                        View all
                      </Link>
                    </div>

                    {notificationsLoading ? (
                      <div className="flex h-40 items-center justify-center">
                        <div
                          className="
                            h-6 w-6
                            animate-spin
                            rounded-full
                            border-2
                            border-red-500
                            border-t-transparent
                          "
                        />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div
                        className="
                          flex h-40
                          flex-col
                          items-center
                          justify-center
                          px-4
                          text-center
                        "
                      >
                        <Bell className="h-8 w-8 text-muted-foreground" />

                        <p className="mt-3 text-sm font-medium">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          You&apos;re all caught up.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[420px] overflow-y-auto">
                        {notifications.slice(0, 8).map((notification) => (
                          <div
                            key={notification._id}
                            className={`
                              group
                              flex gap-3
                              border-b
                              border-border
                              p-3
                              transition-colors
                              ${
                                notification.read
                                  ? "hover:bg-muted/50"
                                  : "bg-red-50/50 hover:bg-red-50"
                              }
                            `}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationRead(notification)
                              }
                              className="min-w-0 flex-1 text-left"
                            >
                              <p
                                className={`
                                  line-clamp-1
                                  text-sm
                                  font-semibold
                                  ${
                                    notification.read
                                      ? "text-foreground"
                                      : "text-red-600"
                                  }
                                `}
                              >
                                {notification.title}
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                            </button>

                            <div className="flex shrink-0 items-start gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={async (e) => {
                                    e.stopPropagation();

                                    try {
                                      await markNotificationAsRead(
                                        notification._id,
                                      );

                                      setNotifications((prev) =>
                                        prev.map((item) =>
                                          item._id === notification._id
                                            ? {
                                                ...item,
                                                read: true,
                                              }
                                            : item,
                                        ),
                                      );

                                      setUnreadCount((prev) =>
                                        Math.max(prev - 1, 0),
                                      );
                                    } catch (error) {
                                      console.error(error);
                                    }
                                  }}
                                  className="h-7 w-7 rounded-full"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationDelete(notification._id);
                                }}
                                className="
                                  h-7 w-7
                                  rounded-full
                                  text-muted-foreground
                                  hover:text-red-500
                                "
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="border-t border-border p-2">
                        <Link
                          href="/settings/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="
                            block
                            rounded-xl
                            py-2
                            text-center
                            text-sm
                            font-medium
                            text-red-500
                            transition
                            hover:bg-red-50
                          "
                        >
                          See all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Menu */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className={`
                      relative
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      ${
                        isPremiumUser
                          ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-md"
                          : "border-2 border-border"
                      }
                    `}
                  >
                    {isPremiumUser && (
                      <div
                        className="
                          absolute
                          -right-1
                          -top-1
                          z-10
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-background
                          shadow-sm
                        "
                      >
                        <Crown className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      </div>
                    )}

                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="
                    w-64
                    rounded-xl
                    border border-border
                    bg-popover
                    p-2
                    text-popover-foreground
                    shadow-xl
                  "
                >
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div
                          className={`
                            flex h-11 w-11
                            items-center justify-center
                            rounded-full
                            ${
                              isPremiumUser
                                ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 p-[2px]"
                                : ""
                            }
                          `}
                        >
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={45}
                            height={45}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>

                        {isPremiumUser && (
                          <span
                            className="
                              absolute
                              -right-1
                              -top-1
                              flex
                              h-4 w-4
                              items-center
                              justify-center
                              rounded-full
                              bg-background
                            "
                          >
                            <Crown className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">{user.name}</p>

                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>

                        {isPremiumUser && (
                          <p className="mt-0.5 text-xs font-semibold capitalize text-yellow-600">
                            {membershipPlan} Member
                          </p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Mobile + Tablet Premium */}

                  {!isPremiumUser && (
                    <DropdownMenuItem
                      asChild
                      className="
                        text-red-600
                        hover:bg-red-50
                        lg:hidden
                      "
                    >
                      <Link
                        href="/settings/membership"
                        className="flex w-full items-center font-semibold"
                      >
                        <Crown className="mr-3 h-4 w-4 text-yellow-500" />
                        Get Binge Premium
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Home */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname === "/"
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link href="/" className="flex w-full items-center">
                      <Home className="mr-3 h-4 w-4" />
                      Home
                    </Link>
                  </DropdownMenuItem>

                  {/* Channel */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname.startsWith("/channel")
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link
                      href={
                        user.hasChannel ? "/channel/me" : "/channel/create"
                      }
                      className="group flex w-full items-center"
                    >
                      <User className="mr-3 h-4 w-4 transition-colors group-hover:text-red-500" />
                      {user.hasChannel ? "My Channel" : "Create Channel"}
                    </Link>
                  </DropdownMenuItem>

                  {/* History */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname === "/history"
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link href="/history" className="flex w-full items-center">
                      <History className="mr-3 h-4 w-4" />
                      History
                    </Link>
                  </DropdownMenuItem>

                  {/* Favorites */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname === "/favorites"
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link
                      href="/favorites"
                      className="flex w-full items-center"
                    >
                      <Heart className="mr-3 h-4 w-4" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>

                  {/* Watch Later */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname === "/watch-later"
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link
                      href="/watch-later"
                      className="flex w-full items-center"
                    >
                      <Clock3 className="mr-3 h-4 w-4" />
                      Watch Later
                    </Link>
                  </DropdownMenuItem>

                  {/* Downloads */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname === "/downloads"
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link
                      href="/downloads"
                      className="flex w-full items-center"
                    >
                      <Download className="mr-3 h-4 w-4" />
                      Downloads
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Settings */}

                  <DropdownMenuItem
                    asChild
                    className={
                      pathname.startsWith("/settings")
                        ? "bg-red-50 text-red-500"
                        : "text-foreground hover:bg-red-50 hover:text-red-500"
                    }
                  >
                    <Link
                      href="/settings"
                      className="flex w-full items-center"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sign Out */}

                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() => {
                      logout();
                      router.replace("/login");
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* =================================
               SIGN IN
            ================================= */

            <Link href="/login">
              <Button
                className="
                  rounded-full
                  bg-red-500
                  px-4 sm:px-6
                  text-white
                  hover:bg-red-600
                "
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;