"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Globe,
  Mail,
  Code2,
  GraduationCap,
  Sparkles,
  Play,
  Users,
  ShieldCheck,
  Languages,
  CreditCard,
  Video,
  MessageSquare,
  Heart,
  Clock3,
  Download,
  Radio,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AboutPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* =====================================================
            Back to Settings
        ===================================================== */}

        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        {/* =====================================================
            Hero
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-500/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
            <div className="shrink-0">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-border bg-background shadow-sm sm:h-32 sm:w-32">
                <Image
                  src="/binge.png"
                  alt="Binge"
                  width={105}
                  height={105}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-500">
                About Binge
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Stream. Discover. Binge.
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Binge is a modern full-stack video streaming platform
                designed to provide an engaging, personalized, and
                feature-rich video watching experience.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <Badge
                  icon={Code2}
                  text="Full Stack Project"
                />

                <Badge
                  icon={Play}
                  text="Video Platform"
                />

                <Badge
                  icon={Sparkles}
                  text="AI Enabled"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            Developer
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="Developer"
            title="Meet the Developer"
            description="The person behind the design, development, and engineering of Binge."
          />

          <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="grid lg:grid-cols-[280px_1fr]">
              {/* Profile */}

              <div className="flex flex-col items-center justify-center border-b border-border bg-muted/40 p-8 text-center lg:border-b-0 lg:border-r">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <span className="text-4xl font-bold">
                    MK
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-bold text-foreground">
                  Mayank Kesharwani
                </h2>

                <p className="mt-1 font-medium text-red-500">
                  Full-Stack Developer
                </p>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Computer Science Engineering student and developer
                  passionate about building modern web applications,
                  AI-powered experiences, and innovative software.
                </p>
              </div>

              {/* Developer Details */}

              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-foreground">
                  About Me
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  I am Mayank Kesharwani, a Computer Science Engineering
                  student at Harcourt Butler Technical University (HBTU),
                  Kanpur, with a strong interest in full-stack web
                  development, artificial intelligence, software
                  engineering, and modern web technologies.
                </p>

                <p className="mt-4 leading-7 text-muted-foreground">
                  I enjoy turning ideas into complete working products —
                  from designing interfaces and building APIs to managing
                  databases, authentication, payments, real-time features,
                  cloud services, and deployment.
                </p>

                <p className="mt-4 leading-7 text-muted-foreground">
                  My development journey focuses on learning by building.
                  I enjoy working with technologies such as React, Next.js,
                  Node.js, Express, MongoDB, TypeScript, and modern UI
                  frameworks while continuously exploring AI and emerging
                  technologies.
                </p>

                <p className="mt-4 leading-7 text-muted-foreground">
                  Binge is one of my major projects through which I explored
                  how multiple technologies can work together to create a
                  complete production-style application.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ProfileItem
                    icon={GraduationCap}
                    title="Education"
                    value="B.Tech CSE — HBTU Kanpur"
                  />

                  <ProfileItem
                    icon={Code2}
                    title="Primary Focus"
                    value="Full-Stack Development"
                  />

                  <ProfileItem
                    icon={Sparkles}
                    title="Interests"
                    value="AI, Web, Software & Innovation"
                  />

                  <ProfileItem
                    icon={Radio}
                    title="Current Project"
                    value="Binge"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            About Binge
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="The Project"
            title="What is Binge?"
            description="A complete streaming-inspired platform built from the ground up."
          />

          <div className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <Play className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">
                  A modern video experience
                </h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  Binge is a full-stack video streaming application
                  inspired by modern video platforms. It provides users
                  with a complete ecosystem for discovering, watching,
                  saving, interacting with, and managing video content.
                </p>

                <p className="mt-4 leading-7 text-muted-foreground">
                  The application goes beyond basic video playback by
                  combining authentication, subscriptions, memberships,
                  personalized libraries, social interactions, comments,
                  watch history, Watch Later, downloads, Watch Party,
                  notifications, language translation, and AI-powered
                  functionality into one platform.
                </p>

                <p className="mt-4 leading-7 text-muted-foreground">
                  The project was developed to explore real-world
                  full-stack engineering challenges such as secure
                  authentication, API design, database relationships,
                  payment integration, real-time communication, cloud
                  media storage, responsive UI development, internationalization,
                  and production deployment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            Features
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="Capabilities"
            title="What Binge Offers"
            description="Major features currently built into the platform."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Play}
              title="Video Streaming"
              description="Watch videos through a responsive custom video player with playback controls, seeking, fullscreen, skip controls, and suggested videos."
            />

            <FeatureCard
              icon={ShieldCheck}
              title="Authentication"
              description="Secure user authentication with OTP-based email verification and protected account functionality."
            />

            <FeatureCard
              icon={Heart}
              title="Likes & Reactions"
              description="Interact with videos and comments through likes and reactions."
            />

            <FeatureCard
              icon={Clock3}
              title="Watch Later"
              description="Save videos to a personal Watch Later library and manage saved content."
            />

            <FeatureCard
              icon={Download}
              title="Video Downloads"
              description="Authenticated users can download videos according to their membership limits."
            />

            <FeatureCard
              icon={Users}
              title="Watch Party"
              description="Create synchronized Watch Party sessions and watch videos together in real time."
            />

            <FeatureCard
              icon={MessageSquare}
              title="Comments"
              description="Comment on videos, interact with comments, edit your own comments, and manage comment activity."
            />

            <FeatureCard
              icon={Languages}
              title="Comment Translation"
              description="Translate comments between supported languages using the integrated DeepL translation service."
            />

            <FeatureCard
              icon={CreditCard}
              title="Membership"
              description="Premium membership plans provide additional watch time, downloads, premium video access, and ad-free viewing."
            />

            <FeatureCard
              icon={Radio}
              title="Notifications"
              description="Receive application notifications related to account and platform activity."
            />

            <FeatureCard
              icon={Video}
              title="Creator Features"
              description="Users can create channels and manage their own creator presence on the platform."
            />

            <FeatureCard
              icon={Globe}
              title="Responsive Design"
              description="Designed to provide a consistent experience across desktop, tablet, and mobile devices."
            />
          </div>
        </section>

        {/* =====================================================
            Technology Stack
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="Engineering"
            title="Technology Stack"
            description="Technologies used to build and power Binge."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StackCard
              title="Frontend"
              items={[
                "Next.js 16",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "Lucide Icons",
              ]}
            />

            <StackCard
              title="Backend"
              items={[
                "Node.js",
                "Express.js",
                "REST APIs",
                "Socket.IO",
                "JWT Authentication",
              ]}
            />

            <StackCard
              title="Database"
              items={[
                "MongoDB",
                "Mongoose",
                "Schema-based data modeling",
              ]}
            />

            <StackCard
              title="Cloud Services"
              items={[
                "Cloudinary",
                "Brevo",
                "DeepL",
                "Razorpay",
              ]}
            />

            <StackCard
              title="Development"
              items={[
                "Git",
                "GitHub",
                "ESLint",
                "Responsive UI",
                "Environment Configuration",
              ]}
            />

            <StackCard
              title="Internationalization"
              items={[
                "next-intl",
                "Multi-language UI",
                "Comment Translation",
              ]}
            />
          </div>
        </section>

        {/* =====================================================
            Architecture
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="Architecture"
            title="How Binge is Built"
            description="A modern client-server architecture designed for maintainability and scalability."
          />

          <div className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <ArchitectureCard
                step="01"
                title="Frontend"
                description="Next.js handles the user interface, routing, server components, client components, authentication state, responsive layouts, and interactive experiences."
              />

              <ArchitectureCard
                step="02"
                title="API Layer"
                description="The Express.js backend provides REST APIs for authentication, videos, comments, likes, subscriptions, memberships, downloads, notifications, and other platform features."
              />

              <ArchitectureCard
                step="03"
                title="Data & Services"
                description="MongoDB stores application data while Cloudinary, Brevo, DeepL, Razorpay, and Socket.IO provide specialized cloud and real-time functionality."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            Project Details
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="Project Information"
            title="Binge at a Glance"
            description="Core information about the current version of the application."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>

        {/* =====================================================
            Vision
        ===================================================== */}

        <section className="mt-10">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Vision for Binge
                </h2>

                <p className="mt-3 max-w-4xl leading-7 text-muted-foreground">
                  The long-term vision for Binge is to create a polished
                  video platform that combines entertainment, discovery,
                  personalization, creator tools, social interaction, and
                  intelligent features in one ecosystem.
                </p>

                <p className="mt-3 max-w-4xl leading-7 text-muted-foreground">
                  The project can continue evolving with improvements to
                  recommendations, creator functionality, AI-powered
                  experiences, performance, accessibility, personalization,
                  and the overall viewing experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            Website & Social Media
        ===================================================== */}

        <section className="mt-10">
          <SectionHeading
            eyebrow="Connect"
            title="Website & Social Media"
            description="Explore my work, projects, and online presence."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Personal Website */}

            <a
              href="https://yourwebsite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
                <Globe className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  Personal Website
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Visit my personal website and portfolio
                </p>
              </div>
            </a>

            {/* GitHub */}

            <a
              href="https://github.com/mayank-kesharwani"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground transition group-hover:bg-foreground group-hover:text-background">
                <FaGithub className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  GitHub
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Explore my projects and source code
                </p>
              </div>
            </a>

            {/* LinkedIn */}

            <a
              href="https://www.linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <span className="text-xl font-bold">
                  in
                </span>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  LinkedIn
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Connect with me professionally
                </p>
              </div>
            </a>

            {/* YouTube */}

            <a
              href="https://www.youtube.com/@your-channel"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
                <Play className="h-6 w-6 fill-current" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  YouTube
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Videos, tutorials, and tech content
                </p>
              </div>
            </a>

            {/* Instagram */}

            <a
              href="https://www.instagram.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 transition group-hover:bg-pink-500 group-hover:text-white">
                <span className="text-xl font-bold">
                  @
                </span>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  Instagram
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Follow me for updates and behind the scenes
                </p>
              </div>
            </a>

            {/* Email */}

            <a
              href="mailto:your@email.com"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
                <Mail className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  Contact Me
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Get in touch for collaboration or inquiries
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* =====================================================
            Binge Repository
        ===================================================== */}

        <section className="mt-10">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <FaGithub className="h-6 w-6 text-foreground" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Binge Source Code
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Explore the complete source code, implementation,
                    and development history of Binge.
                  </p>
                </div>
              </div>

              <a
                href="https://github.com/mayank-kesharwani/Binge-Website"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <FaGithub className="h-4 w-4" />
                View Repository
              </a>
            </div>
          </div>
        </section>

        {/* =====================================================
            Footer
        ===================================================== */}

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built with{" "}
            <span className="text-red-500">♥</span>{" "}
            by{" "}
            <span className="font-semibold text-foreground">
              Mayank Kesharwani
            </span>
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Binge — Stream. Discover. Binge.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* =====================================================
   Reusable Components
===================================================== */

type IconType = React.ComponentType<{
  className?: string;
}>;

type BadgeProps = {
  icon: IconType;
  text: string;
};

function Badge({
  icon: Icon,
  text,
}: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="h-4 w-4 text-red-500" />
      {text}
    </span>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <span className="text-sm font-semibold uppercase tracking-wider text-red-500">
        {eyebrow}
      </span>

      <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}

type ProfileItemProps = {
  icon: IconType;
  title: string;
  value: string;
};

function ProfileItem({
  icon: Icon,
  title,
  value,
}: ProfileItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {title}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: IconType;
  title: string;
  description: string;
};

function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400/50 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-bold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

type StackCardProps = {
  title: string;
  items: string[];
};

function StackCard({
  title,
  items,
}: StackCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-bold text-foreground">
        {title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

type ArchitectureCardProps = {
  step: string;
  title: string;
  description: string;
};

function ArchitectureCard({
  step,
  title,
  description,
}: ArchitectureCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <span className="text-sm font-bold text-red-500">
        {step}
      </span>

      <h3 className="mt-3 text-lg font-bold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h3 className="mt-2 font-semibold text-foreground">
        {value}
      </h3>
    </div>
  );
}