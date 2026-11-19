import type { Metadata } from "next";
import { CalendarView } from "@/components/calendar-view";

export const metadata: Metadata = { title: "𝐌𝐲𝐔𝐌𝐊 ♦︎ 📅" };

export default function CalendarPage() {
  return <CalendarView />;
}
