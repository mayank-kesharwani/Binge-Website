import { PlaySquare } from "lucide-react";

const SubscriptionsHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          <PlaySquare className="h-5 w-5 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Subscriptions
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Channels you are subscribed to
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsHeader;