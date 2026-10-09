import type { Metadata } from "next";
import { TimetableEditor } from "@/components/timetable-editor";

export const metadata: Metadata = { title: "Edit Timetable · My UMK" };

export default function TimetablePage() {
  return <TimetableEditor />;
}
