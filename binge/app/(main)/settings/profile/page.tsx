"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import {
  getMyProfile,
  updateProfile,
} from "@/services/user.service";

import { useAuthStore } from "@/store/authStore";

import { toast } from "sonner";

import type { UserProfileForm } from "@/types/user";

import ProfileAvatar from "@/components/settings/ProfileAvatar";
import ProfileForm from "@/components/settings/ProfileForm";
import ProfileActions from "@/components/settings/ProfileActions";

export default function ProfileSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatar] = useState<File | null>(null);

  const [initialForm, setInitialForm] =
    useState<UserProfileForm | null>(null);

  const [form, setForm] = useState<UserProfileForm>({
    name: "",
    username: "",
    email: "",
    bio: "",
    avatar: "",
  });

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const hasChanges = useMemo(() => {
    if (!initialForm) return false;

    return (
      JSON.stringify(form) !==
        JSON.stringify(initialForm) ||
      avatar !== null
    );
  }, [form, initialForm, avatar]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();

        const user = response.data;

        const formData = {
          name: user.name ?? "",
          username: user.username ?? "",
          email: user.email ?? "",
          bio: user.bio ?? "",
          avatar: user.avatar ?? "",
        };

        setForm(formData);
        setInitialForm(formData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("bio", form.bio);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const response = await updateProfile(formData);

      setUser(response.data);

      const updatedForm = {
        name: response.data.name,
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio,
        avatar: response.data.avatar,
      };

      setForm(updatedForm);
      setInitialForm(updatedForm);
      setAvatar(null);

      toast.success("Profile updated successfully");

      setTimeout(() => {
        router.push("/settings");
      }, 800);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to update profile",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />

          <p className="text-muted-foreground">
            Loading profile...
          </p>
        </div>
      ) : (
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
              Profile Settings
            </span>

            <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              Your Profile
            </h1>

            <p className="mt-3 text-muted-foreground">
              Manage your personal information and account
              profile.
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <ProfileAvatar
              avatar={avatar}
              setAvatar={setAvatar}
              initialAvatar={form.avatar}
            />
          </div>

          <div className="mt-6 sm:mt-8">
            <ProfileForm
              form={form}
              setForm={setForm}
            />
          </div>

          <div className="mt-6 sm:mt-8">
            <ProfileActions
              loading={saving}
              hasChanges={hasChanges}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}