"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Globe, Mail } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AboutPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        <div className="mb-8">
          <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            About
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            About Binge
          </h1>

          <p className="mt-3 text-muted-foreground">
            Learn more about the application and its developer.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/binge.png"
              alt="Binge"
              width={90}
              height={90}
            />

            <h2 className="mt-4 text-2xl font-bold text-foreground">
              Binge
            </h2>

            <p className="mt-2 text-muted-foreground">
              Stream. Discover. Binge.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <InfoCard
              title="Version"
              value="1.0.0"
            />

            <InfoCard
              title="Framework"
              value="Next.js 16"
            />

            <InfoCard
              title="Backend"
              value="Node.js + Express"
            />

            <InfoCard
              title="Database"
              value="MongoDB"
            />

            <InfoCard
              title="Developer"
              value="Mayank Kesharwani"
            />

            <InfoCard
              title="UI"
              value="Tailwind CSS + shadcn/ui"
            />
          </div>

          <div className="mt-10 space-y-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/20"
            >
              <FaGithub className="h-5 w-5 text-red-500" />
              GitHub Repository
            </a>

            <a
              href="mailto:your@email.com"
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/20"
            >
              <Mail className="h-5 w-5 text-red-500" />
              Contact Developer
            </a>

            <a
              href="#"
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/20"
            >
              <Globe className="h-5 w-5 text-red-500" />
              Official Website
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

type InfoCardProps = {
  title: string;
  value: string;
};

function InfoCard({
  title,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h3 className="mt-2 font-semibold text-foreground">
        {value}
      </h3>
    </div>
  );
}