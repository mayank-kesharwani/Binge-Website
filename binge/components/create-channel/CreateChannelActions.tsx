"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { createChannel } from "@/services/channel.service";

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

export default function CreateChannelActions({
  form,
  avatar,
  banner,
}: Props) {
  const router = useRouter();

  const { user, setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const handleCreateChannel = async () => {
    if (!form.channelName.trim()) {
      return toast.error("Channel name is required");
    }

    if (!form.handle.trim()) {
      return toast.error("Handle is required");
    }

    if (!avatar) {
      return toast.error("Please upload an avatar");
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

      formData.append(
        "avatar",
        avatar
      );

      if (banner) {
        formData.append(
          "banner",
          banner
        );
      }

      await createChannel(formData);

      if (user) {
        setUser({
          ...user,
          hasChannel: true,
        });
      }

      toast.success("Channel created successfully");

      setTimeout(() => {
        router.push("/channel/me");
      }, 1000);

    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to create channel"
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
            Ready to create your channel?
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            You can always edit your channel later from
            Creator Settings.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">

          <Link href="/">
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
            onClick={handleCreateChannel}
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
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Create Channel
              </>
            )}
          </Button>

        </div>

      </div>
    </section>
  );
}