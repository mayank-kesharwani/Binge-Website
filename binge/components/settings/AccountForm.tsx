"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { PasswordForm } from "@/types/user";

type AccountFormProps = {
  form: PasswordForm;
  setForm: React.Dispatch<
    React.SetStateAction<PasswordForm>
  >;
};

export default function AccountForm({
  form,
  setForm,
}: AccountFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">
        Change Password
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Update your password to keep your account secure.
      </p>

      <div className="mt-8 space-y-6">
        {/* Current Password */}
        <div>
          <Label>Current Password</Label>

          <div className="relative mt-2">
            <Input
              type={
                showCurrentPassword
                  ? "text"
                  : "password"
              }
              value={form.currentPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              className="bg-background pr-12 text-foreground"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(
                  !showCurrentPassword
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-red-500"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <Label>New Password</Label>

          <div className="relative mt-2">
            <Input
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              value={form.newPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="bg-background pr-12 text-foreground"
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  !showNewPassword
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-red-500"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <Label>Confirm Password</Label>

          <Input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className="mt-2 bg-background text-foreground"
          />
        </div>
      </div>
    </div>
  );
}