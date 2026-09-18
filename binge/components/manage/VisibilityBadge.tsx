import {
  Globe,
  Lock,
  Link2,
} from "lucide-react";

type Props = {
  visibility:
    | "public"
    | "private"
    | "unlisted";
};

export default function VisibilityBadge({
  visibility,
}: Props) {
  if (visibility === "public") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        <Globe className="h-3 w-3" />
        Public
      </span>
    );
  }

  if (visibility === "private") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <Lock className="h-3 w-3" />
        Private
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      <Link2 className="h-3 w-3" />
      Unlisted
    </span>
  );
}