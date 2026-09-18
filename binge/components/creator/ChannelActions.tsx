"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChannelActionsProps = {
  loading: boolean;
  hasChanges: boolean;
  onSave: () => void;
};

export default function ChannelActions({
  loading,
  hasChanges,
  onSave,
}: ChannelActionsProps) {
  return (
    <div
      className="
        sticky
        bottom-6
        z-40
        mt-10
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-border
        bg-card/95
        p-6
        text-card-foreground
        shadow-xl
        backdrop-blur
        md:flex-row
        md:items-center
        md:justify-between

        dark:shadow-black/30
      "
    >
      {/* Status */}
      <div>
        {hasChanges ? (
          <>
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Save your changes to update your channel.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-green-600 dark:text-green-400">
              Everything is up to date
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              No changes to save.
            </p>
          </>
        )}
      </div>

      {/* Save Button */}
      <Button
        onClick={onSave}
        disabled={loading || !hasChanges}
        className="
          h-12
          w-full
          rounded-xl
          bg-red-500
          px-8
          text-white
          transition
          hover:bg-red-600
          disabled:cursor-not-allowed
          disabled:opacity-50
          md:w-auto
        "
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}