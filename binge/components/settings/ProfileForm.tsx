"use client";

import type { UserProfileForm } from "@/types/user";

type ProfileFormProps = {
  form: UserProfileForm;
  setForm: React.Dispatch<
    React.SetStateAction<UserProfileForm>
  >;
};

export default function ProfileForm({
  form,
  setForm,
}: ProfileFormProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        Personal Information
      </h2>

      <div className="grid gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Full Name
          </label>

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Username
          </label>

          <input
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Bio
          </label>

          <textarea
            rows={5}
            value={form.bio}
            onChange={(e) =>
              setForm({
                ...form,
                bio: e.target.value,
              })
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>
    </div>
  );
}