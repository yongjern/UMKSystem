import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SubjectCatalog } from "@/components/subject-catalog";

export const metadata: Metadata = {
  title: "Subject Catalog · My UMK",
  description: "Browse all available UMK subjects.",
};

export default function SubjectsPage() {
  return (
    <main className="subjects-shell">
      <header className="subjects-header">
        <Link href="/" className="back-link"><ArrowLeft size={17} /> DASHBOARD</Link>
        <div><span className="eyebrow">UMK ACADEMIC CATALOG</span><h1>ALL SUBJECTS.</h1><p>Browse the complete subject list available in the timetable editor.</p></div>
      </header>
      <SubjectCatalog />
    </main>
  );
}
