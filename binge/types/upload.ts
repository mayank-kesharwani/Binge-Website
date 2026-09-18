export type VideoVisibility =
  | "public"
  | "unlisted"
  | "private";

export interface UploadForm {
  title: string;
  description: string;
  category: string;
  duration: string;
  visibility: VideoVisibility;
  tags: string[];
  isPremium: boolean;
}