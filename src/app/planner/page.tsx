import type { Metadata } from "next";
import { Planner } from "@/components/planner";

export const metadata: Metadata = {
  title: "Academic Planner · My UMK",
  description: "Track UMK assignments, exams, and deadlines.",
};

export default function PlannerPage() {
  return <Planner />;
}