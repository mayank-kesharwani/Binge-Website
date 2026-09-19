"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      const link = target?.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href) return;

      // Ignore external links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("#")
      ) {
        return;
      }

      // Ignore new-tab / modified clicks
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      // Ignore same-page links
      if (href === window.location.pathname) {
        return;
      }

      setLoading(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  if (!loading) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[99999] -translate-x-1/2">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 shadow-lg backdrop-blur">
        <Loader2 className="h-5 w-5 animate-spin text-red-500" />
      </div>
    </div>
  );
}