"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TermsPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Back */}
        <Link
          href="/settings/privacy"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Privacy
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600">
            Terms & Conditions
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Terms & Conditions
          </h1>

          <p className="mt-3 text-muted-foreground">
            Please read the terms that apply when using
            Binge.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Acceptance */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-5 w-5 text-red-500" />
              </div>

              <h2 className="text-xl font-semibold text-foreground">
                Acceptance of Terms
              </h2>
            </div>

            <p className="text-sm leading-7 text-muted-foreground">
              By creating an account or using Binge, you
              agree to follow these Terms & Conditions and
              any applicable policies available on the
              platform.
            </p>
          </section>

          {/* Using Binge */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Using Binge
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Binge provides a platform for users to
              discover, watch, save, and interact with
              video content. You are responsible for using
              the platform in a lawful and respectful
              manner.
            </p>
          </section>

          {/* Accounts */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              User Accounts
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              You are responsible for maintaining the
              security of your account credentials and for
              activity performed through your account.
              Account information should be accurate and
              kept up to date.
            </p>
          </section>

          {/* Content */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Content
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Users may upload or interact with content
              according to the features provided by Binge.
              You should only upload or share content that
              you have the right to use and distribute.
            </p>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Content that violates applicable laws,
              infringes the rights of others, or
              interferes with the operation of Binge may
              be restricted or removed.
            </p>
          </section>

          {/* Prohibited Use */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Prohibited Use
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>
                Do not use Binge for unlawful activities.
              </li>

              <li>
                Do not attempt to gain unauthorized access
                to accounts, systems, or data.
              </li>

              <li>
                Do not interfere with the operation or
                security of the platform.
              </li>

              <li>
                Do not upload content that infringes
                another person&apos;s rights.
              </li>

              <li>
                Do not misuse platform features or attempt
                to circumvent applicable restrictions.
              </li>
            </ul>
          </section>

          {/* Availability */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Service Availability
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Binge may add, modify, suspend, or remove
              features from time to time. We may also
              perform maintenance or updates that
              temporarily affect availability.
            </p>
          </section>

          {/* Termination */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Account Suspension or Termination
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Access to Binge may be restricted or
              terminated when an account is used in
              violation of these terms, applicable law, or
              the security and integrity of the platform.
            </p>
          </section>

          {/* Changes */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Changes to These Terms
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              These Terms & Conditions may be updated as
              Binge evolves. Updated terms will be made
              available on this page.
            </p>
          </section>

          {/* Last Updated */}
          <p className="pb-4 text-center text-xs text-muted-foreground">
            Last updated: September 2026
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}