"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PublicRoute from "@/components/auth/PublicRoute";

import { signup } from "@/services/auth.service";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      return toast.error("Please fill all fields.");
    }

    try {
      setLoading(true);

      const response = await signup({
        name,
        email,
        password,
      });

      if (!response.data?.otpRequired) {
        return toast.error(
          "Unable to start email verification.",
        );
      }

      toast.success(
        "Verification OTP sent to your email.",
      );

      router.replace(
        `/verify-otp?email=${encodeURIComponent(
          response.data.email ||
            email.trim().toLowerCase(),
        )}&type=signup`,
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Signup failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <AuthLayout
        title="Create Your Account"
        subtitle="Join Binge and start sharing amazing videos."
        footerText="Already have an account?"
        footerLinkText="Login"
        footerLink="/login"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSignup()
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

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
              e.key === "Enter" && handleSignup()
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onEnter={handleSignup}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Sending OTP..."
            : "Create Account"}
        </button>
      </AuthLayout>
    </PublicRoute>
  );
}