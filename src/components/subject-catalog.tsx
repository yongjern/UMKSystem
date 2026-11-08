"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import subjects from "@/data/subjects.json";

export function SubjectCatalog() {
  const [query, setQuery] = useState("");
  const filteredSubjects = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return subjects;
    return subjects.filter((subject) => `${subject.code} ${subject.name}`.toLocaleLowerCase().includes(term));
  }, [query]);

  return (
    <>
      <label className="subject-search">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by subject code or name" aria-label="Search subjects" />
      </label>
      <p className="subject-count">SHOWING {filteredSubjects.length} OF {subjects.length} SUBJECTS</p>
      <section className="subject-grid" aria-live="polite">
        {filteredSubjects.map((subject) => <article key={subject.code}><strong>{subject.code}</strong><span>{subject.name}</span></article>)}
      </section>
      {!filteredSubjects.length ? <p className="subject-empty">No matching subjects.</p> : null}
    </>
  );
}
