"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  User,
  Shield,
  Bell,
  Palette,
  Lock,
  ChevronRight,
  Info,
  Crown,
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");

  const settings = [
    {
      title: t("profile"),
      description: t("profileDescription"),
      href: "/settings/profile",
      icon: User,
    },
    {
      title: t("accountSettings"),
      description: t("accountDescription"),
      href: "/settings/account",
      icon: Shield,
    },
    {
      title: t("preferences"),
      description: t("preferencesDescription"),
      href: "/settings/preferences",
      icon: Palette,
    },
    {
      title: t("notifications"),
      description: t("notificationsDescription"),
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      title: t("privacySettings"),
      description: t("privacyDescription"),
      href: "/settings/privacy",
      icon: Lock,
    },
    {
      title: t("aboutSettings"),
      description: t("aboutDescription"),
      href: "/settings/about",
      icon: Info,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-10">
        <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600">
          {t("badge")}
        </span>

        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          {t("title")}
        </h1>

        <p className="mt-3 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* BINGE PREMIUM */}
      <div className="mb-10">
        <Link
          href="/settings/membership"
          className="group block overflow-hidden rounded-3xl border border-red-200 bg-red-50 p-6 transition hover:border-red-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-red-500 p-4 text-white">
                <Crown className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-black">
                  {t("premiumTitle")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("premiumDescription")}
                </p>
              </div>
            </div>

            <ChevronRight className="h-6 w-6 shrink-0 text-red-500 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* ACCOUNT */}
      <div className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("account")}
        </h2>

        <div className="space-y-4">
          {settings
            .filter((item) =>
              [
                t("profile"),
                t("accountSettings"),
                t("preferences"),
              ].includes(item.title)
            )
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground transition hover:border-red-300 hover:bg-red-50/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-xl bg-red-50 p-4 text-red-500 transition group-hover:bg-red-100">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-red-500" />
                </Link>
              );
            })}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("privacy")}
        </h2>

        <div className="space-y-4">
          {settings
            .filter((item) =>
              [
                t("notifications"),
                t("privacySettings"),
              ].includes(item.title)
            )
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground transition hover:border-red-300 hover:bg-red-50/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-xl bg-red-50 p-4 text-red-500 transition group-hover:bg-red-100">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-red-500" />
                </Link>
              );
            })}
        </div>
      </div>

      {/* ABOUT */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("about")}
        </h2>

        <div className="space-y-4">
          {settings
            .filter(
              (item) => item.title === t("aboutSettings")
            )
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground transition hover:border-red-300 hover:bg-red-50/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-xl bg-red-50 p-4 text-red-500 transition group-hover:bg-red-100">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:text-red-500" />
                </Link>
              );
            })}
        </div>
      </div>
    </main>
  );
}