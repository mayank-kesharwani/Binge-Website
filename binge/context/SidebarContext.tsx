"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type SidebarContextType = {
  isOpen: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
};

const SidebarContext = createContext<
  SidebarContextType | undefined
>(undefined);

export function SidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 767px)",
    );

    const handleScreenChange = (
      event?: MediaQueryListEvent,
    ) => {
      const mobile =
        event?.matches ?? mediaQuery.matches;

      setIsMobile(mobile);

      // Always close the mobile drawer
      // when switching to desktop.
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleScreenChange();

    mediaQuery.addEventListener(
      "change",
      handleScreenChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleScreenChange,
      );
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen((previous) => !previous);
      return;
    }

    setIsOpen((previous) => !previous);
  };

  const closeMobileSidebar = () => {
    if (!isMobileOpen) return;

    setIsMobileOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isMobile,
        isMobileOpen,
        toggleSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error(
      "useSidebar must be used within SidebarProvider",
    );
  }

  return context;
}