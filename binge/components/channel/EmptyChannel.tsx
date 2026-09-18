"use client";

import Link from "next/link";
import { Video, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyChannelProps = {
  isOwner?: boolean;
};

export default function EmptyChannel({
  isOwner = false,
}: EmptyChannelProps) {
  return (
    <section className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">

      <div className="rounded-full bg-red-50 p-6">
        <Video className="h-12 w-12 text-red-500" />
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        No videos yet
      </h2>

      <p className="mt-3 max-w-md text-gray-500">
        {isOwner
          ? "Start sharing your content with the world by uploading your first video."
          : "This creator hasn't uploaded any videos yet."}
      </p>

      {isOwner && (
        <Link href="/upload" className="mt-8">
          <Button className="rounded-full bg-red-600 px-8 hover:bg-red-700">
            <Upload className="mr-2 h-5 w-5" />
            Upload First Video
          </Button>
        </Link>
      )}

    </section>
  );
}