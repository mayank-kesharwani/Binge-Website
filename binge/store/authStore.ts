import { create } from "zustand";
import { persist } from "zustand/middleware";

type MembershipPlan =
  | "free"
  | "bronze"
  | "silver"
  | "gold";

type MembershipStatus =
  | "active"
  | "expired"
  | "cancelled";

interface Membership {
  plan: MembershipPlan;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  lastPaymentId: string;
  razorpayCustomerId: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  hasChannel: boolean;

  membership?: Membership;

  preferences?: {
    language: string;
    theme: "system" | "light" | "dark";
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasHydrated: boolean;

  setUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false,

      setUser: (user) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...user,
              }
            : (user as User),
        })),

      setToken: (token) =>
        set({
          token,
        }),

      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
        }),
    }),
    {
      name: "auth-storage",

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);