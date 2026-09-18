"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateChannel } from "@/services/channel.service";

import {
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

type Props = {
  form: {
    channelName: string;
    handle: string;
    description: string;
  };
  avatar: File | null;
  banner: File | null;
};

export default function EditChannelActions({
  form,
  avatar,
  banner,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleUpdateChannel = async () => {
    if (!form.channelName.trim()) {
      return toast.error("Channel name is required");
    }

    if (!form.handle.trim()) {
      return toast.error("Handle is required");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "channelName",
        form.channelName
      );

      formData.append(
        "handle",
        form.handle
      );

      formData.append(
        "description",
        form.description
      );

      if (avatar) {
        formData.append(
          "avatar",
          avatar
        );
      }

      if (banner) {
        formData.append(
          "banner",
          banner
        );
      }

      await updateChannel(formData);

      toast.success(
        "Channel updated successfully"
      );

      router.push("/channel/me");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update channel"
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
        rounded-3xl
        border
        border-border
        bg-card/90
        p-5
        text-card-foreground
        shadow-xl
        backdrop-blur-md
      "
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        {/* Message */}
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Save your changes?
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Your channel information will be updated
            immediately.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">

          <Link href="/channel/me">
            <Button
              variant="outline"
              className="
                rounded-full
                border-border
                text-foreground
                hover:border-red-500
                hover:bg-red-50
                hover:text-red-500
                dark:hover:bg-red-950/30
              "
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </Link>

          <Button
            onClick={handleUpdateChannel}
            disabled={loading}
            className="
              rounded-full
              bg-red-500
              px-8
              text-white
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>

        </div>

      </div>
    </section>
  );
}