import SearchVideoCard from "@/components/search/SearchVideoCard";
import SearchEmpty from "@/components/search/SearchEmpty";
import { searchVideos } from "@/services/video.service";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() || "";

  let filteredVideos = [];

  if (query) {
    try {
      const response = await searchVideos(query);
      filteredVideos = response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {query ? (
            <>
              Search results for{" "}
              <span className="text-red-500">
                "{query}"
              </span>
            </>
          ) : (
            "Search"
          )}
        </h1>

        {query && (
          <p className="mt-2 text-muted-foreground">
            {filteredVideos.length}{" "}
            {filteredVideos.length === 1
              ? "video found"
              : "videos found"}
          </p>
        )}
      </div>

      {!query && <SearchEmpty />}

      {query && filteredVideos.length === 0 && (
        <SearchEmpty query={query} />
      )}

      {query && filteredVideos.length > 0 && (
        <div className="space-y-6">
          {filteredVideos.map((video: any) => (
            <SearchVideoCard
              key={video._id}
              video={video}
            />
          ))}
        </div>
      )}
    </main>
  );
}