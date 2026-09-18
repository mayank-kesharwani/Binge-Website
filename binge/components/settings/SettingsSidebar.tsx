"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Palette,
  Bell,
  Lock,
  Settings,
} from "lucide-react";

const links = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    name: "Account",
    href: "/settings/account",
    icon: Shield,
  },
  {
    name: "Preferences",
    href: "/settings/preferences",
    icon: Palette,
  },
  {
    name: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    name: "Privacy",
    href: "/settings/privacy",
    icon: Lock,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-full bg-red-100 p-2 dark:bg-red-950/40">
          <Settings className="h-5 w-5 text-red-500" />
        </div>

        <div>
          <h2 className="font-semibold text-foreground">
            Binge Settings
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage your account
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-red-500 text-white shadow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}