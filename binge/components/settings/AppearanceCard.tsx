"use client";

import { useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import type { PreferenceForm } from "@/types/user";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

type AppearanceCardProps = {
  form: PreferenceForm;
  setForm: React.Dispatch<
    React.SetStateAction<PreferenceForm>
  >;
};

const themes = [
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description:
      "Automatically match your device settings.",
  },
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Use the light appearance.",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Use the dark appearance.",
  },
] as const;

export default function AppearanceCard({
  form,
  setForm,
}: AppearanceCardProps) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(form.theme);
  }, [form.theme, setTheme]);

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">
        Appearance
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Choose how Binge looks across the application.
      </p>

      <RadioGroup
        value={form.theme}
        onValueChange={(value) =>
          setForm((prev) => ({
            ...prev,
            theme: value as
              | "system"
              | "light"
              | "dark",
          }))
        }
        className="mt-6 space-y-4"
      >
        {themes.map((theme) => {
          const Icon = theme.icon;

          return (
            <div
              key={theme.value}
              className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-100 p-2 text-red-500 dark:bg-red-950/40">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <Label
                    htmlFor={theme.value}
                    className="cursor-pointer text-base font-medium text-foreground"
                  >
                    {theme.label}
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    {theme.description}
                  </p>
                </div>
              </div>

              <RadioGroupItem
                id={theme.value}
                value={theme.value}
              />
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}