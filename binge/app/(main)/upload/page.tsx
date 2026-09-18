"use client";

import { useState } from "react";
import { Crown, LockKeyhole } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import UploadDropzone from "@/components/upload/UploadDropzone";
import UploadThumbnail from "@/components/upload/UploadThumbnail";
import UploadDetails from "@/components/upload/UploadDetails";
import UploadTags from "@/components/upload/UploadTags";
import UploadVisibility from "@/components/upload/UploadVisibility";
import PublishActions from "@/components/upload/PublishActions";

import type { UploadForm } from "@/types/upload";

export default function UploadPage() {
  const [video, setVideo] = useState<File | null>(null);

  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [form, setForm] = useState<UploadForm>({
    title: "",
    description: "",
    category: "Technology",
    duration: "",
    visibility: "public",
    tags: [],
    isPremium: false,
  });

  const handlePremiumChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      isPremium: checked,
    }));
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600">
            Creator Studio
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Upload Video
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Share your creativity with the Binge community. Upload your video,
            customize the thumbnail, add details, choose visibility, and publish
            when you're ready.
          </p>
        </div>

        {/* Upload Section */}
        <UploadDropzone video={video} setVideo={setVideo} setForm={setForm} />

        {/* Details + Thumbnail */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_420px]">
          <div className="space-y-8">
            <UploadDetails form={form} setForm={setForm} />

            <UploadTags form={form} setForm={setForm} />

            <UploadVisibility form={form} setForm={setForm} />

            {/* Premium Video */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    {form.isPremium ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <LockKeyhole className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Premium Video
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Make this video available only to users with an active
                      paid membership.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={form.isPremium}
                    onChange={(event) =>
                      handlePremiumChange(event.target.checked)
                    }
                    className="peer sr-only"
                  />

                  <div className="h-7 w-12 rounded-full bg-muted transition peer-checked:bg-red-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/30" />

                  <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              <div className="mt-5 rounded-xl bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    {form.isPremium
                      ? "This video will be locked for users without an active paid membership."
                      : "This video will be available to all users according to its visibility settings."}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="h-fit lg:sticky lg:top-24">
            <UploadThumbnail
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-10">
          <PublishActions video={video} thumbnail={thumbnail} form={form} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
