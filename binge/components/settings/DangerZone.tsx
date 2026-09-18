"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DangerZoneProps = {
  loading: boolean;
  onDelete: () => void;
};

export default function DangerZone({
  loading,
  onDelete,
}: DangerZoneProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/60 dark:bg-red-950/20">
      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
        Danger Zone
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Permanently delete your account and all associated data. This action
        cannot be undone.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="mt-6">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete your account?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone.
              <br />
              <br />
              Your channel, videos, comments, likes, subscriptions,
              playlists, and account data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}