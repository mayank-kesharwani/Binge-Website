"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { UploadForm } from "@/types/upload";

import {
  Loader2,
  Save,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateVideo } from "@/services/video.service";

type Props = {
  id: string;
  thumbnail: File | null;
  form: UploadForm;
};

export default function EditVideoActions({
  id,
  thumbnail,
  form,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!form.title.trim()) {
      return toast.error("Title is required.");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("visibility", form.visibility);
      formData.append("tags", JSON.stringify(form.tags));
      formData.append(
        "isPremium",
        String(form.isPremium ?? false),
      );

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await updateVideo(id, formData);

      toast.success("Video updated successfully!");

      router.push("/manage");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ??
          "Failed to update video",
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
            Save your changes?
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Update your video's information and thumbnail.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/manage">
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
            disabled={loading}
            onClick={handleUpdate}
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
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}