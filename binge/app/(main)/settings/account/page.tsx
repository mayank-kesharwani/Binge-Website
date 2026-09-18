"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { changePassword, deleteAccount } from "@/services/user.service";

import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import type { PasswordForm } from "@/types/user";

import AccountForm from "@/components/settings/AccountForm";
import AccountActions from "@/components/settings/AccountActions";
import DangerZone from "@/components/settings/DangerZone";

export default function AccountSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);

  const hasChanges = useMemo(() => {
    return (
      form.currentPassword.trim() !== "" &&
      form.newPassword.trim() !== "" &&
      form.confirmPassword.trim() !== ""
    );
  }, [form]);

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSaving(true);

      await changePassword(form);

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");

      setTimeout(() => {
        router.replace("/settings");
      }, 700);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to change password",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteAccount();

      logout();

      toast.success("Account deleted successfully");

      router.replace("/login");
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to delete account",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        <div className="mb-8">
          <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            Account Settings
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Security & Account
          </h1>

          <p className="mt-3 text-muted-foreground">
            Manage your password and account security.
          </p>
        </div>

        <div className="mt-6 sm:mt-8">
          <AccountForm
            form={form}
            setForm={setForm}
          />
        </div>

        <div className="mt-6 sm:mt-8">
          <AccountActions
            loading={saving}
            hasChanges={hasChanges}
            onSave={handleSave}
          />
        </div>

        <div className="mt-8 sm:mt-10">
          <DangerZone
            loading={deleting}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}