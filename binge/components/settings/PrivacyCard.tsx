"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type PrivacyCardProps = {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export default function PrivacyCard({
  title,
  description,
  checked,
  onCheckedChange,
}: PrivacyCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="max-w-xl">
        <Label className="text-base font-semibold text-foreground">
          {title}
        </Label>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}