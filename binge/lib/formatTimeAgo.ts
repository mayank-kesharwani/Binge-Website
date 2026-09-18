import { formatDistanceToNow } from "date-fns";

export default function timeAgo(date: string) {
  return formatDistanceToNow(
    new Date(date),
    {
      addSuffix: true,
    }
  );
}