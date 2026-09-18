"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getPreferences, updatePreferences } from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";
import type { PreferenceForm } from "@/types/user";

import AppearanceCard from "@/components/settings/AppearanceCard";
// import PlaybackCard from "@/components/settings/PlaybackCard";
import LanguageCard from "@/components/settings/LanguageCard";
import PreferenceActions from "@/components/settings/PreferenceActions";
import NotificationPreferencesCard from "@/components/settings/NotificationPreferencesCard";

export default function PreferencesPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [initialForm, setInitialForm] = useState<PreferenceForm>({
    theme: "system",
    autoplay: true,
    inlinePlayback: true,
    rememberProgress: true,
    language: "en",

    notifications: {
      newVideos: true,
      newSubscribers: true,
      likes: true,
      comments: true,
      replies: true,
      accountUpdates: true,
      systemUpdates: true,
    },
  });

  const [form, setForm] = useState<PreferenceForm>(initialForm);

  const hasChanges = useMemo(() => {
    return (
      form.theme !== initialForm.theme ||
      form.autoplay !== initialForm.autoplay ||
      form.inlinePlayback !== initialForm.inlinePlayback ||
      form.rememberProgress !== initialForm.rememberProgress ||
      form.language !== initialForm.language ||
      form.notifications.newVideos !== initialForm.notifications.newVideos ||
      form.notifications.newSubscribers !==
        initialForm.notifications.newSubscribers ||
      form.notifications.likes !== initialForm.notifications.likes ||
      form.notifications.comments !== initialForm.notifications.comments ||
      form.notifications.replies !== initialForm.notifications.replies ||
      form.notifications.accountUpdates !==
        initialForm.notifications.accountUpdates ||
      form.notifications.systemUpdates !==
        initialForm.notifications.systemUpdates
    );
  }, [form, initialForm]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await getPreferences();

        setForm(response.data);
        setInitialForm(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await updatePreferences(form);

      setForm(response.data);
      setInitialForm(response.data);

      setUser({
        preferences: response.data,
      });

      // Update locale cookie
      document.cookie = `locale=${form.language}; path=/; max-age=31536000`;

      toast.success("Preferences updated successfully");

      router.refresh();

      setTimeout(() => {
        router.replace("/settings");
      }, 700);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ?? "Failed to update preferences",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />

          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </ProtectedRoute>
    );
  }

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
            Preferences
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Preferences
          </h1>

          <p className="mt-3 text-muted-foreground">
            Personalize your Binge experience.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <AppearanceCard form={form} setForm={setForm} />

          {/* <PlaybackCard form={form} setForm={setForm} /> */}

          <LanguageCard form={form} setForm={setForm} />

          <NotificationPreferencesCard form={form} setForm={setForm} />

          <PreferenceActions
            loading={saving}
            hasChanges={hasChanges}
            onSave={handleSave}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
