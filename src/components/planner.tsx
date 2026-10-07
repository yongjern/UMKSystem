"use client";

import { ArrowLeft, CalendarClock, Check, ClipboardList, ExternalLink, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { courseNames } from "@/data/schedule";
import { deletePlannerItem, getPlannerItems, savePlannerItem, type PlannerItem } from "@/lib/event-database";

function timeRemaining(dueAt: string, now: Date) {
  const milliseconds = new Date(dueAt).getTime() - now.getTime();
  if (milliseconds <= 0) return "OVERDUE";
  const hours = Math.ceil(milliseconds / 3600000);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}D ${hours % 24}H LEFT` : `${hours}H LEFT`;
}

function midnightOnDate(date: string) {
  return `${date}T00:00`;
}

export function Planner() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [kind, setKind] = useState<PlannerItem["kind"]>("assignment");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState(Object.keys(courseNames)[0]);
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [hyperlink, setHyperlink] = useState("");

  useEffect(() => {
    void getPlannerItems().then(setItems);
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !dueAt) return;
    const item: PlannerItem = {
      id: crypto.randomUUID(),
      kind,
      title: title.trim().toUpperCase(),
      courseCode,
      dueAt: new Date(dueAt).toISOString(),
      notes: notes.trim(),
      hyperlink: hyperlink.trim(),
      completed: false,
    };
    await savePlannerItem(item);
    setItems((current) => [...current, item].sort((first, second) => new Date(first.dueAt).getTime() - new Date(second.dueAt).getTime()));
    setTitle("");
    setDueAt("");
    setNotes("");
    setHyperlink("");
  }

  async function toggleItem(item: PlannerItem) {
    const updatedItem = { ...item, completed: !item.completed };
    await savePlannerItem(updatedItem);
    setItems((current) => current.map((currentItem) => currentItem.id === item.id ? updatedItem : currentItem));
  }

  async function removeItem(id: string) {
    await deletePlannerItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const activeItems = items.filter((item) => !item.completed);
  const nextExam = activeItems.find((item) => item.kind === "exam");

  return (
    <main className="planner-shell">
      <header className="planner-header">
        <Link href="/" className="back-link"><ArrowLeft size={17} /> DASHBOARD</Link>
        <div><span className="eyebrow">PLANNER</span><h1>MAKE YOUR PLAN, DO YOUR PLAN.</h1></div>
        <span className="planner-count">{activeItems.length.toString().padStart(2, "0")} ACTIVE</span>
      </header>

      {nextExam ? <section className="exam-countdown"><CalendarClock size={30} /><div><span>NEXT EXAM</span><h2>{nextExam.title.toUpperCase()}</h2><p>{nextExam.courseCode} · {new Date(nextExam.dueAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</p></div><strong>{timeRemaining(nextExam.dueAt, now)}</strong></section> : null}

      <div className="planner-grid">
        <form className="planner-form" onSubmit={addItem}>
          <div><span className="eyebrow">NEW PLAN</span><h2>Plan the next deadline</h2></div>
          <label><span>TYPE</span><select value={kind} onChange={(event) => setKind(event.target.value as PlannerItem["kind"])}><option value="assignment">Assignment</option><option value="exam">Exam</option><option value="revision">Revision</option></select></label>
          <label><span>COURSE</span><select value={courseCode} onChange={(event) => setCourseCode(event.target.value)}>{Object.entries(courseNames).map(([code, name]) => <option value={code} key={code}>{code} · {name}</option>)}<option value="OTHER">OTHER</option></select></label>
          <label><span>TITLE</span><input value={title} onChange={(event) => setTitle(event.target.value.toUpperCase())} placeholder="QUIZ, REPORT, PRESENTATION..." required /></label>
          <label><span>DEADLINE</span><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value ? midnightOnDate(event.target.value.slice(0, 10)) : "")} required /></label>
          <label><span>HYPERLINK</span><input type="url" value={hyperlink} onChange={(event) => setHyperlink(event.target.value)} placeholder="https://..." pattern="https?://.*" /></label>
          <label><span>NOTES</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Submission notes or exam venue" rows={3} /></label>
          <button type="submit"><Plus size={17} /> ADD TO PLANNER</button>
        </form>

        <section className="planner-list" aria-labelledby="planner-list-title">
          <div className="planner-list-heading"><div><span className="eyebrow">YOUR PLAN HERE :3</span><h2 id="planner-list-title">DO IT BEFORE DEADLINE.</h2></div><ClipboardList size={25} /></div>
          {items.length ? items.map((item) => {
            const overdue = !item.completed && new Date(item.dueAt) <= now;
            return <article className={`planner-item${item.completed ? " completed" : ""}${overdue ? " overdue" : ""}`} key={item.id}>
              <button className="complete-item" onClick={() => void toggleItem(item)} aria-label={`${item.completed ? "Reopen" : "Complete"} ${item.title}`}><Check size={16} /></button>
              <div className="planner-item-copy"><span>{item.kind.toUpperCase()} · {item.courseCode}</span><h3>{item.title.toUpperCase()}</h3>{item.notes ? <p>{item.notes}</p> : null}{item.hyperlink ? <a href={item.hyperlink} target="_blank" rel="noreferrer">OPEN LINK <ExternalLink size={12} /></a> : null}</div>
              <time dateTime={item.dueAt}><strong>{timeRemaining(item.dueAt, now)}</strong>{new Date(item.dueAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</time>
              <button className="remove-item" onClick={() => void removeItem(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button>
            </article>;
          }) : <div className="planner-empty"><ClipboardList size={30} /><p>No assignments or exams yet.</p></div>}
        </section>
      </div>
    </main>
  );
}