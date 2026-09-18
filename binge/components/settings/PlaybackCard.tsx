"use client";

import {
  Play,
  MonitorPlay,
  Clock3,
} from "lucide-react";

import type { PreferenceForm } from "@/types/user";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type PlaybackCardProps = {
  form: PreferenceForm;
  setForm: React.Dispatch<
    React.SetStateAction<PreferenceForm>
  >;
};

export default function PlaybackCard({
  form,
  setForm,
}: PlaybackCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">
        Playback
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Customize how videos play across Binge.
      </p>

      <div className="mt-6 space-y-4">
        {/* Autoplay */}
        <div className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-2 text-red-500 dark:bg-red-950/40">
              <Play className="h-5 w-5" />
            </div>

            <div>
              <Label className="text-base font-medium text-foreground">
                Autoplay next video
              </Label>

              <p className="text-sm text-muted-foreground">
                Automatically play the next recommended video.
              </p>
            </div>
          </div>

          <Switch
            checked={form.autoplay}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                autoplay: checked,
              }))
            }
          />
        </div>

        {/* Inline Playback */}
        <div className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-2 text-red-500 dark:bg-red-950/40">
              <MonitorPlay className="h-5 w-5" />
            </div>

            <div>
              <Label className="text-base font-medium text-foreground">
                Inline playback
              </Label>

              <p className="text-sm text-muted-foreground">
                Play videos directly while browsing.
              </p>
            </div>
          </div>

          <Switch
            checked={form.inlinePlayback}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                inlinePlayback: checked,
              }))
            }
          />
        </div>

        {/* Remember Progress */}
        <div className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-2 text-red-500 dark:bg-red-950/40">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <Label className="text-base font-medium text-foreground">
                Remember video progress
              </Label>

              <p className="text-sm text-muted-foreground">
                Resume videos from where you left off.
              </p>
            </div>
          </div>

          <Switch
            checked={form.rememberProgress}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                rememberProgress: checked,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}