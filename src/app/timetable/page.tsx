import type { Metadata } from "next";
import { TimetableEditor } from "@/components/timetable-editor";

export const metadata: Metadata = { title: "𝐌𝐲𝐔𝐌𝐊 ♦︎ 🔃🛎" };

export default function TimetablePage() {
  return <TimetableEditor />;
}
