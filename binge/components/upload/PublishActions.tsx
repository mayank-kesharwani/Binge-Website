"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UploadForm } from "@/types/upload";

import {
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadVideo } from "@/services/video.service";

type Props = {
  video: File | null;
  thumbnail: File | null;
  form: UploadForm;
};

export default function PublishActions({
  video,
  thumbnail,
  form,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!video) {
      return toast.error("Please select a video.");
    }

    if (!thumbnail) {
      return toast.error("Please upload a thumbnail.");
    }

    if (!form.title.trim()) {
      return toast.error("Title is required.");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("duration", form.duration);
      formData.append("video", video);
      formData.append("thumbnail", thumbnail);
      formData.append("visibility", form.visibility);
      formData.append("tags", JSON.stringify(form.tags));

      // Premium video setting
      formData.append(
        "isPremium",
        String(form.isPremium ?? false)
      );

      const response = await uploadVideo(formData);

      toast.success("Video uploaded successfully!");

      router.push(`/watch/${response.data._id}`);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ?? "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="
        sticky
        bottom-6
        z-20
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--card)]/95
        p-5
        text-[var(--foreground)]
        shadow-xl
        backdrop-blur-md
      "
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Ready to publish?
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Review your details before publishing.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/channel/me">
            <Button
              variant="outline"
              disabled={loading}
              className="
                rounded-full
                border-[var(--border)]
                bg-[var(--card)]
                text-[var(--foreground)]
                hover:border-red-500
                hover:bg-red-50
                hover:text-red-500
              "
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </Link>

          <Button
            variant="secondary"
            disabled={loading}
            className="
              rounded-full
              bg-[var(--muted)]
              text-[var(--foreground)]
              hover:bg-[var(--muted)]/80
            "
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>

          <Button
            disabled={loading}
            onClick={handlePublish}
            className="
              rounded-full
              bg-red-500
              px-6
              text-white
              hover:bg-red-600
            "
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish Video
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}