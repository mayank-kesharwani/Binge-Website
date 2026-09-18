import { MessageCircleOff } from "lucide-react";

export default function EmptyComments() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <MessageCircleOff className="h-12 w-12 text-muted-foreground" />

      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No comments yet
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        Be the first to start the conversation.
      </p>
    </div>
  );
}