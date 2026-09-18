"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Globe,
  Video,
  Lock,
  Eye,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ManageVideoTable from "@/components/manage/ManageVideoTable";

import {
  getMyVideos,
  deleteVideo,
} from "@/services/video.service";

export default function ManageVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "public" | "private" | "unlisted"
  >("all");

  const [sortBy, setSortBy] = useState<
    | "newest"
    | "oldest"
    | "views"
    | "leastViews"
    | "az"
    | "za"
  >("newest");

  const [category, setCategory] = useState("all");

  const fetchVideos = async () => {
    try {
      const response = await getMyVideos();

      setVideos(response.data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo(id);

      toast.success("Video deleted successfully");

      fetchVideos();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete video");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setCategory("all");
    setSortBy("newest");
  };

  const categories = [
    "all",
    ...new Set(
      videos
        .map((video) => video.category)
        .filter(Boolean),
    ),
  ];

  const filteredVideos = [...videos]
    .filter((video) => {
      const query = search.toLowerCase();

      const matchesSearch =
        video.title.toLowerCase().includes(query) ||
        video.category?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all"
          ? true
          : video.visibility === filter;

      const matchesCategory =
        category === "all"
          ? true
          : video.category === category;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesCategory
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );

        case "oldest":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );

        case "views":
          return b.views - a.views;

        case "leastViews":
          return a.views - b.views;

        case "az":
          return a.title.localeCompare(b.title);

        case "za":
          return b.title.localeCompare(a.title);

        default:
          return 0;
      }
    });

  const counts = useMemo(() => {
    return {
      all: videos.length,
      public: videos.filter(
        (v) => v.visibility === "public",
      ).length,
      private: videos.filter(
        (v) => v.visibility === "private",
      ).length,
      unlisted: videos.filter(
        (v) => v.visibility === "unlisted",
      ).length,
      totalViews: videos.reduce(
        (sum, video) => sum + (video.views ?? 0),
        0,
      ),
    };
  }, [videos]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Manage Videos
          </h1>

          <p className="mt-2 text-muted-foreground">
            Edit, organize and manage all your uploaded
            videos.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-red-500" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Total Videos
                </p>

                <p className="text-2xl font-bold text-foreground">
                  {counts.all}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-green-600" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Public
                </p>

                <p className="text-2xl font-bold text-foreground">
                  {counts.public}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-amber-500" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Private
                </p>

                <p className="text-2xl font-bold text-foreground">
                  {counts.private}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-500" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Total Views
                </p>

                <p className="text-2xl font-bold text-foreground">
                  {counts.totalViews}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-lg">
            <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                h-12
                w-full
                rounded-xl
                border
                border-border
                bg-background
                pl-12
                pr-4
                text-sm
                text-foreground
                outline-none
                transition
                placeholder:text-muted-foreground
                focus:border-red-500
                focus:ring-2
                focus:ring-red-500/20
              "
            />
          </div>

          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background text-foreground lg:w-56">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                >
                  {cat === "all"
                    ? "All Categories"
                    : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(
                value as
                  | "newest"
                  | "oldest"
                  | "views"
                  | "leastViews"
                  | "az"
                  | "za",
              )
            }
          >
            <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background text-foreground lg:w-56">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="newest">
                Newest
              </SelectItem>

              <SelectItem value="oldest">
                Oldest
              </SelectItem>

              <SelectItem value="views">
                Most Viewed
              </SelectItem>

              <SelectItem value="leastViews">
                Least Viewed
              </SelectItem>

              <SelectItem value="az">
                A → Z
              </SelectItem>

              <SelectItem value="za">
                Z → A
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={
              search === "" &&
              filter === "all" &&
              category === "all" &&
              sortBy === "newest"
            }
            className="h-12 rounded-xl border-border bg-background px-6 text-foreground hover:bg-accent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            {
              id: "all",
              label: `All (${counts.all})`,
            },
            {
              id: "public",
              label: `🌍 Public (${counts.public})`,
            },
            {
              id: "private",
              label: `🔒 Private (${counts.private})`,
            },
            {
              id: "unlisted",
              label: `🔗 Unlisted (${counts.unlisted})`,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setFilter(
                  item.id as
                    | "all"
                    | "public"
                    | "private"
                    | "unlisted",
                )
              }
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                filter === item.id
                  ? "bg-red-500 text-white"
                  : "border border-border bg-background text-foreground hover:border-red-500 hover:text-red-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading...
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              {search || filter !== "all"
                ? "No matching videos found"
                : "No videos uploaded"}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {search || filter !== "all"
                ? "Try changing the search or filter."
                : "Upload your first video to get started."}
            </p>
          </div>
        ) : (
          <ManageVideoTable
            videos={filteredVideos}
            onDelete={handleDelete}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}