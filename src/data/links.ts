export type LinkCategory = "campus" | "tools";

export type QuickLink = {
  name: string;
  description: string;
  url: string;
  category: LinkCategory;
  icon: "book" | "calendar" | "campus" | "file" | "message" | "sparkles" | "video" | "wifi";
  campusOnly?: boolean;
};