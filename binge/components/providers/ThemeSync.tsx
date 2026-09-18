"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";

export default function ThemeSync() {
  const { user, hasHydrated } = useAuthStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!hasHydrated || !user) return;

    const preference = user.preferences?.theme ?? "system";

    let theme = preference;

    if (preference === "system") {
      const indiaTime = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      );

      const hour = indiaTime.getHours();

      theme = hour >= 10 && hour < 12 ? "light" : "dark";
    }

    setTheme(theme);
  }, [user, setTheme]);

  return null;
}
