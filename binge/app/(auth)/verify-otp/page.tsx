"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/axios";
import { verifyLoginOtp } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import AuthLayout from "@/components/auth/AuthLayout";

const OTP_EXPIRY_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESENDS = 5;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "login";

  const { setUser, setToken } = useAuthStore();
  const { setTheme } = useTheme();

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [expiryTimer, setExpiryTimer] = useState(
    OTP_EXPIRY_SECONDS,
  );

  const [resendTimer, setResendTimer] = useState(
    RESEND_COOLDOWN_SECONDS,
  );

  const [resendsUsed, setResendsUsed] = useState(0);

  const inputRefs =
    useRef<(HTMLInputElement | null)[]>([]);

  // Prevent duplicate verification requests.
  const verificationInProgress = useRef(false);

  const isSignupVerification = type === "signup";

  useEffect(() => {
    if (expiryTimer <= 0) return;

    const interval = setInterval(() => {
      setExpiryTimer((prev) =>
        Math.max(prev - 1, 0),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) =>
        Math.max(prev - 1, 0),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (
    value: string,
    index: number,
  ) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otp];

    updated[index] = value.slice(-1);

    setOtp(updated);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 5
    ) {
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (!verificationInProgress.current) {
        handleVerify();
      }
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updated = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted.split("").forEach(
      (digit, index) => {
        updated[index] = digit;
      },
    );

    setOtp(updated);

    inputRefs.current[
      Math.min(pasted.length, 6) - 1
    ]?.focus();
  };

  const handleVerify = async () => {
    if (verificationInProgress.current) {
      return;
    }

    if (!email) {
      toast.error(
        "Verification email is missing.",
      );
      return;
    }

    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Enter all 6 digits.");
      return;
    }

    verificationInProgress.current = true;
    setLoading(true);

    try {
      const response = isSignupVerification
        ? await api.post(
            "/auth/verify-signup-otp",
            {
              email,
              otp: code,
            },
          )
        : await verifyLoginOtp({
            email,
            otp: code,
          });

      const responseBody = response.data;

      /*
       * ApiResponse normally returns the payload under `data`.
       * Support both shapes so this page works regardless of
       * the current ApiResponse implementation.
       */
      const data =
        responseBody?.data || responseBody;

      if (!data?.user || !data?.token) {
        throw new Error(
          "Verification succeeded but authentication data was not returned.",
        );
      }

      setUser(data.user);
      setToken(data.token);

      setTheme(
        data.user.preferences?.theme ||
          "system",
      );

      document.cookie = `locale=${
        data.user.preferences?.language ||
        "en"
      }; path=/; max-age=31536000`;

      toast.success(
        isSignupVerification
          ? "Email verified successfully!"
          : "Login successful!",
      );

      router.replace("/");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid or expired OTP";

      /*
       * If the backend has already marked the email as verified,
       * another duplicate request should not make the user think
       * that their successful verification failed.
       */
      if (
        isSignupVerification &&
        message
          .toLowerCase()
          .includes("already verified")
      ) {
        toast.success(
          "Email is already verified. Please log in.",
        );

        router.replace("/login");
        return;
      }

      toast.error(message);

      /*
       * Do NOT mark the OTP as expired based on the local timer.
       * The backend database timestamp is the source of truth.
       */
      if (
        message
          .toLowerCase()
          .includes("otp has expired")
      ) {
        setExpiryTimer(0);
      }
    } finally {
      setLoading(false);
      verificationInProgress.current = false;
    }
  };

  const handleResend = async () => {
    if (!isSignupVerification) {
      toast.error(
        "OTP resend is currently available only for email verification.",
      );
      return;
    }

    if (!email) {
      toast.error(
        "Verification email is missing.",
      );
      return;
    }

    if (resending) return;

    if (resendTimer > 0) {
      return;
    }

    if (resendsUsed >= MAX_RESENDS) {
      toast.error(
        "Maximum OTP resend limit reached. Please sign up again.",
      );
      return;
    }

    try {
      setResending(true);

      const response = await api.post(
        "/auth/resend-signup-otp",
        {
          email,
        },
      );

      const responseBody = response.data;
      const data =
        responseBody?.data || responseBody;

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setExpiryTimer(
        Math.floor(
          (data.expiresIn ||
            OTP_EXPIRY_SECONDS * 1000) /
            1000,
        ),
      );

      setResendTimer(
        Math.floor(
          (data.resendCooldown ||
            RESEND_COOLDOWN_SECONDS * 1000) /
            1000,
        ),
      );

      setResendsUsed(
        data.resendsUsed ??
          resendsUsed + 1,
      );

      inputRefs.current[0]?.focus();

      toast.success(
        "A new verification OTP has been sent.",
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Unable to resend OTP";

      /*
       * If verification already succeeded in another request,
       * don't show it as a resend failure.
       */
      if (
        message
          .toLowerCase()
          .includes("already verified")
      ) {
        toast.success(
          "Email is already verified. Please log in.",
        );

        router.replace("/login");
        return;
      }

      toast.error(message);

      const match = message.match(
        /wait (\d+) seconds/i,
      );

      if (match) {
        setResendTimer(
          Number(match[1]),
        );
      }

      if (
        message
          .toLowerCase()
          .includes("maximum otp resend")
      ) {
        setResendsUsed(
          MAX_RESENDS,
        );
      }
    } finally {
      setResending(false);
    }
  };

  const resendLimitReached =
    resendsUsed >= MAX_RESENDS;

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a 6-digit code to ${email}`}
      footerText=""
      footerLink=""
      footerLinkText=""
    >
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Enter the verification code
          sent to your email.
        </p>

        <p
          className={`text-sm font-medium ${
            expiryTimer > 0
              ? "text-muted-foreground"
              : "text-red-500"
          }`}
        >
          {expiryTimer > 0
            ? `OTP expires in ${formatTime(
                expiryTimer,
              )}`
            : "OTP has expired"}
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            maxLength={1}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`OTP digit ${
              index + 1
            }`}
            disabled={loading}
            onChange={(e) =>
              handleChange(
                e.target.value,
                index,
              )
            }
            onKeyDown={(e) =>
              handleKeyDown(e, index)
            }
            onPaste={handlePaste}
            className="h-12 w-11 rounded-xl border border-border bg-background text-center text-lg font-bold text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-14 sm:text-xl"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={
          loading ||
          otp.join("").length !== 6
        }
        className="mt-8 w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Verifying..."
          : "Verify Email"}
      </button>

      <div className="mt-6 space-y-2 text-center text-sm">
        {!isSignupVerification ? (
          <p className="text-muted-foreground">
            Please complete the login
            verification process.
          </p>
        ) : resendLimitReached ? (
          <>
            <p className="font-medium text-red-500">
              Maximum resend limit reached.
            </p>

            <p className="text-muted-foreground">
              Please sign up again to
              receive a new verification
              code.
            </p>
          </>
        ) : resendTimer > 0 ? (
          <p className="text-muted-foreground">
            Resend OTP in{" "}
            <span className="font-semibold text-foreground">
              {resendTimer}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-red-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending
              ? "Sending..."
              : "Resend OTP"}
          </button>
        )}

        {isSignupVerification &&
          !resendLimitReached && (
            <p className="text-xs text-muted-foreground">
              {MAX_RESENDS -
                resendsUsed}{" "}
              resend
              {MAX_RESENDS -
                resendsUsed !==
              1
                ? "s"
                : ""}{" "}
              remaining
            </p>
          )}
      </div>
    </AuthLayout>
  );
}