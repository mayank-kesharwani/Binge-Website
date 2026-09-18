"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-muted-foreground">
            Learn how Binge collects, uses, and protects
            your information.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Introduction */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <ShieldCheck className="h-5 w-5 text-red-500" />
              </div>

              <h2 className="text-xl font-semibold text-foreground">
                Your Privacy
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Binge respects your privacy and is
                committed to protecting the information
                you provide while using our platform.
              </p>

              <p>
                This Privacy Policy explains what
                information may be collected, how it is
                used, and the choices available to you.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Information We Collect
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Depending on how you use Binge, we may
                collect information such as your name,
                email address, profile information, and
                account preferences.
              </p>

              <p>
                We may also store activity associated with
                your use of Binge, such as watch history,
                saved videos, subscriptions, likes, and
                other interactions with the platform.
              </p>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              How We Use Your Information
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>
                To provide and maintain Binge services.
              </li>

              <li>
                To manage your account and preferences.
              </li>

              <li>
                To provide features such as watch
                history, subscriptions, and saved videos.
              </li>

              <li>
                To communicate important account and
                service updates.
              </li>

              <li>
                To improve the functionality and
                reliability of the platform.
              </li>
            </ul>
          </section>

          {/* Watch History */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Watch History
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Binge may store your watch history to help
              you find previously watched videos and
              provide features related to your viewing
              activity. You can pause or clear your watch
              history through the available privacy and
              history controls.
            </p>
          </section>

          {/* Data Security */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Data Security
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We take reasonable measures to protect
              information associated with your Binge
              account. However, no online service can
              guarantee complete security of information.
            </p>
          </section>

          {/* Your Choices */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Your Choices
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              You can manage certain account, privacy,
              notification, and watch-history settings
              through the Settings section of Binge.
            </p>
          </section>

          {/* Changes */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Changes to This Policy
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              This Privacy Policy may be updated from time
              to time as Binge evolves. Any updated version
              will be made available on this page.
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