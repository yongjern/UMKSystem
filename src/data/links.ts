export type LinkCategory = "campus" | "tools";

export type QuickLink = {
  name: string;
  description: string;
  url: string;
  category: LinkCategory;
  icon: "book" | "calendar" | "campus" | "file" | "message" | "sparkles" | "video" | "wifi";
  campusOnly?: boolean;
};

export const quickLinks: QuickLink[] = [
  { name: "E-Capsule", description: "Student services portal", url: "https://capsule.umk.edu.my/", category: "campus", icon: "campus" },
  { name: "E-Campus", description: "Courses and learning materials", url: "https://ecampus.umk.edu.my/my/", category: "campus", icon: "book" },
  { name: "Blok Kemumin WiFi", description: "Campus network access", url: "http://10.255.255.1:8080/index.html", category: "campus", icon: "wifi", campusOnly: true },
  { name: "Kampus Kota System", description: "Kota campus network portal", url: "http://1.1.1.2/", category: "campus", icon: "wifi", campusOnly: true },
  { name: "UMK Official", description: "University news and information", url: "https://www.umk.edu.my/en/", category: "campus", icon: "campus" },
  { name: "UMK Library", description: "Library services and catalogue", url: "https://library.umk.edu.my/en/index.cfm", category: "campus", icon: "book" },
  { name: "E-PAMS", description: "Past year examination papers", url: "https://exampaper.umk.edu.my/", category: "campus", icon: "file" },
  { name: "Google Meet", description: "Join or start a meeting", url: "https://meet.google.com/", category: "tools", icon: "video" },
  { name: "Google Calendar", description: "Open the full calendar", url: "https://calendar.google.com/", category: "tools", icon: "calendar" },
  { name: "Claude", description: "AI workspace", url: "https://claude.ai/", category: "tools", icon: "sparkles" },
  { name: "NotebookLM", description: "Research and source notebook", url: "https://notebooklm.google.com/", category: "tools", icon: "sparkles" },
  { name: "WhatsApp Web", description: "Messages in your browser", url: "https://web.whatsapp.com/", category: "tools", icon: "message" },
];