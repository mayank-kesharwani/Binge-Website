import { Heart } from "lucide-react";

const FavoritesHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          <Heart className="h-5 w-5 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Favorites
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Videos you've saved to watch again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FavoritesHeader;