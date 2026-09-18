"use client";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProfileActionsProps = {
  loading: boolean;
  hasChanges: boolean;
  onSave: () => void;
};

export default function ProfileActions({
  loading,
  hasChanges,
  onSave,
}: ProfileActionsProps) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onSave}
        disabled={!hasChanges || loading}
        className="rounded-lg bg-red-500 px-8 text-white hover:bg-red-600"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}

        Save Changes
      </Button>
    </div>
  );
}