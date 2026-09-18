"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PublicRoute from "@/components/auth/PublicRoute";

import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("Please fill all fields.");
    }

    try {
      setLoading(true);

      const response = await login({
        email,
        password,
      });

      const data = response.data;

      // OTP required
      if (data.otpRequired) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            data.email,
          )}`,
        );
        return;
      }

      // Normal login
      setUser(data.user);
      setToken(data.token);
      setTheme(data.user.preferences.theme);

      const language =
        response.data.user.preferences?.language ??
        "en";

      document.cookie = `locale=${language}; path=/; max-age=31536000`;

      // Store token in a cookie so Server Components
      // can authenticate requests as the logged-in user.
      document.cookie = `auth-token=${data.token}; path=/; max-age=31536000; samesite=lax`;

      toast.success("Welcome back!");

      router.replace("/");
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            error.response?.data?.error ??
            "Invalid email or password",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <AuthLayout
        title="Welcome Back"
        subtitle="Login to continue your binge."
        footerText="Don't have an account?"
        footerLinkText="Create Account"
        footerLink="/signup"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleLogin()
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onEnter={handleLogin}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </AuthLayout>
    </PublicRoute>
  );
}