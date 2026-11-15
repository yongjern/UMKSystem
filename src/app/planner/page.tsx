import type { Metadata } from "next";
import { Planner } from "@/components/planner";

export const metadata: Metadata = {
  title: "𝐌𝐲𝐔𝐌𝐊 ♦︎ ⏲",
  description: "Track UMK assignments, exams, and deadlines.",
};

export default function PlannerPage() {
  return <Planner />;
}