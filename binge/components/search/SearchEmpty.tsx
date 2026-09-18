import Link from "next/link";
import { SearchX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchEmptyProps = {
  query?: string;
};

const SearchEmpty = ({ query }: SearchEmptyProps) => {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
        <SearchX className="h-14 w-14 text-red-500 dark:text-red-400" />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-foreground">
        No videos found
      </h2>

      {/* Description */}
      <p className="mt-4 max-w-xl text-muted-foreground">
        {query ? (
          <>
            We couldn't find any videos matching{" "}
            <span className="font-semibold text-red-500 dark:text-red-400">
              "{query}"
            </span>
            .
          </>
        ) : (
          "Start searching for your favorite videos on Binge."
        )}
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Try different keywords, check your spelling, or browse
        trending content.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button className="rounded-full bg-red-500 px-6 text-white hover:bg-red-600">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Link href="/">
          <Button
            variant="outline"
            className="
              rounded-full
              border-border
              text-foreground
              hover:border-red-500
              hover:bg-red-50
              hover:text-red-500
              dark:hover:bg-red-950/20
              dark:hover:text-red-400
            "
          >
            Explore Videos
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default SearchEmpty;