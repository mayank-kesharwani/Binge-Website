"use client";

import { Languages } from "lucide-react";
import { LANGUAGES } from "@/constants/languages";
import type { PreferenceForm } from "@/types/user";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LanguageCardProps = {
  form: PreferenceForm;
  setForm: React.Dispatch<
    React.SetStateAction<PreferenceForm>
  >;
};

export default function LanguageCard({
  form,
  setForm,
}: LanguageCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">
        Language
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Choose the language used throughout Binge.
      </p>

      <div className="mt-6 rounded-xl border border-border p-4 transition hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20">
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-lg bg-red-100 p-2 text-red-500 dark:bg-red-950/40">
            <Languages className="h-5 w-5" />
          </div>

          <div>
            <Label className="text-base font-medium text-foreground">
              Preferred Language
            </Label>

            <p className="text-sm text-muted-foreground">
              This changes the language of the Binge interface.
            </p>
          </div>
        </div>

        <Select
          value={form.language}
          onValueChange={(value) =>
            setForm((prev) => ({
              ...prev,
              language: value,
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>

          <SelectContent>
            {LANGUAGES.map((language) => (
              <SelectItem
                key={language.value}
                value={language.value}
              >
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}