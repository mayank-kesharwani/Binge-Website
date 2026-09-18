"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import {
  getMyChannel,
  updateChannel,
} from "@/services/channel.service";

import type { ChannelForm } from "@/types/channel";

import BannerUpload from "@/components/creator/BannerUpload";
import ChannelProfile from "@/components/creator/ChannelProfile";
import ChannelActions from "@/components/creator/ChannelActions";
import SocialLinks from "@/components/creator/SocialLinks";

export default function CustomizeChannelPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [banner, setBanner] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);

  const [initialForm, setInitialForm] =
    useState<ChannelForm | null>(null);

  const [form, setForm] = useState<ChannelForm>({
    channelName: "",
    handle: "",
    description: "",
    avatar: "",
    banner: "",

    website: "",
    github: "",
    linkedin: "",
    instagram: "",
    twitter: "",
  });

  const hasChanges =
    initialForm &&
    (JSON.stringify(form) !== JSON.stringify(initialForm) ||
      avatar !== null ||
      banner !== null);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await getMyChannel();

        const channel = response.data;

        const formData: ChannelForm = {
          channelName: channel.channelName,
          handle: channel.handle,
          description: channel.description ?? "",

          avatar: channel.avatar ?? "",
          banner: channel.banner ?? "",

          website: channel.website ?? "",
          github: channel.github ?? "",
          linkedin: channel.linkedin ?? "",
          instagram: channel.instagram ?? "",
          twitter: channel.twitter ?? "",
        };

        setForm(formData);
        setInitialForm(formData);
      } catch (error) {
        console.error(error);

        toast.error("Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("channelName", form.channelName);
      formData.append("handle", form.handle);
      formData.append("description", form.description);

      formData.append("website", form.website);
      formData.append("github", form.github);
      formData.append("linkedin", form.linkedin);
      formData.append("instagram", form.instagram);
      formData.append("twitter", form.twitter);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      if (banner) {
        formData.append("banner", banner);
      }

      const response = await updateChannel(formData);

      const channel = response.data;

      const updatedForm: ChannelForm = {
        channelName: channel.channelName,
        handle: channel.handle,
        description: channel.description ?? "",

        avatar: channel.avatar ?? "",
        banner: channel.banner ?? "",

        website: channel.website ?? "",
        github: channel.github ?? "",
        linkedin: channel.linkedin ?? "",
        instagram: channel.instagram ?? "",
        twitter: channel.twitter ?? "",
      };

      setForm(updatedForm);
      setInitialForm(updatedForm);

      setAvatar(null);
      setBanner(null);

      toast.success("Channel updated successfully");
    } catch (error) {
      console.error(error);

      toast.error("Failed to update channel");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main
          className="
            min-h-screen
            bg-background
            text-foreground
          "
        >
          <div
            className="
              mx-auto
              flex
              h-[70vh]
              max-w-7xl
              items-center
              justify-center
              px-6
            "
          >
            <p className="text-lg text-muted-foreground">
              Loading channel...
            </p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main
        className="
          min-h-screen
          bg-background
          text-foreground
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-8
            sm:px-6
            lg:px-8
          "
        >
          {/* Header */}
          <div className="mb-10">
            <span
              className="
                rounded-full
                bg-red-100
                px-4
                py-1
                text-sm
                font-medium
                text-red-600

                dark:bg-red-950/40
                dark:text-red-400
              "
            >
              Creator Studio
            </span>

            <h1
              className="
                mt-4
                text-4xl
                font-bold
                tracking-tight
                text-foreground
              "
            >
              Customize Channel
            </h1>

            <p className="mt-3 text-muted-foreground">
              Customize your channel branding
              and information.
            </p>
          </div>

          {/* Banner */}
          <BannerUpload
            banner={banner}
            setBanner={setBanner}
            initialBanner={form.banner}
          />

          {/* Channel Profile */}
          <div className="mt-8">
            <ChannelProfile
              avatar={avatar}
              setAvatar={setAvatar}
              initialAvatar={form.avatar}
              form={form}
              setForm={setForm}
            />
          </div>

          {/* Social Links */}
          <div className="mt-8">
            <SocialLinks
              form={form}
              setForm={setForm}
            />
          </div>

          {/* Actions */}
          <div className="mt-8">
            <ChannelActions
              loading={saving}
              hasChanges={!!hasChanges}
              onSave={handleSave}
            />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}