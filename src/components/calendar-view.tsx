"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AccountButton } from "@/components/account-button";
import { useAuth } from "@/lib/auth-context";
import type { CalendarEvent } from "@/lib/calendar";
import { deleteCustomEvent, getCustomEvents, getPlannerItems, saveCustomEvent, type PlannerItem } from "@/lib/event-database";

type CalendarEntry = { id: string; title: string; date: Date; end?: Date; location: string; kind: "event" | "planner"; source?: CalendarEvent };

function localInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function CalendarView() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [savedEvents, savedPlans] = await Promise.all([getCustomEvents(userId), getPlannerItems(userId)]);
      setEvents(savedEvents);
      setPlannerItems(savedPlans);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load calendar.");
    }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const entries = useMemo<CalendarEntry[]>(() => [
    ...events.map((event) => ({ id: event.id, title: event.title, date: new Date(event.start), end: new Date(event.end), location: event.location, kind: "event" as const, source: event })),
    ...plannerItems.filter((item) => !item.completed).map((item) => ({ id: item.id, title: item.title, date: new Date(item.dueAt), location: item.courseCode, kind: "planner" as const })),
  ], [events, plannerItems]);

  const firstGridDate = new Date(month);
  firstGridDate.setDate(1 - firstGridDate.getDay());
  const days = Array.from({ length: 42 }, (_, index) => { const date = new Date(firstGridDate); date.setDate(firstGridDate.getDate() + index); return date; });
  const selectedEntries = selectedDate ? entries.filter((entry) => dateKey(entry.date) === dateKey(selectedDate)) : [];

  function openCreate(date: Date) {
    const startDate = new Date(date); startDate.setHours(9, 0, 0, 0);
    const endDate = new Date(startDate); endDate.setHours(10);
    setEditing(null); setSelectedDate(date); setTitle(""); setLocation(""); setStart(localInput(startDate)); setEnd(localInput(endDate));
  }
  function openEdit(event: CalendarEvent) {
    setEditing(event); setSelectedDate(new Date(event.start)); setTitle(event.title); setLocation(event.location === "No location" ? "" : event.location); setStart(localInput(new Date(event.start))); setEnd(localInput(new Date(event.end)));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !title.trim() || !start || !end || new Date(end) <= new Date(start)) return;
    const item: CalendarEvent = { id: editing?.id ?? `custom-${crypto.randomUUID()}`, title: title.trim(), location: location.trim() || "No location", start: new Date(start).toISOString(), end: new Date(end).toISOString(), allDay: false };
    try { await saveCustomEvent(item, userId); await load(); setEditing(null); setTitle(""); setStart(""); setEnd(""); setLocation(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save event."); }
  }
  async function remove(id: string) {
    if (!userId) return;
    try { await deleteCustomEvent(id, userId); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete event."); }
  }

  return (
    <main className="calendar-shell">
      <header className="calendar-header"><Link href="/" className="back-link"><ArrowLeft size={17} /> DASHBOARD</Link><div><span className="eyebrow">PERSONAL CALENDAR</span><h1>PLAN THE MONTH.</h1></div><AccountButton /></header>
      {!userId ? <section className="editor-gate"><h2>{authLoading ? "Checking sign-in…" : "Sign in to open your calendar"}</h2><p>Your Planner deadlines and personal activities are private.</p><Link href="/login">SIGN IN</Link></section> : <>
        <div className="calendar-toolbar"><button onClick={() => setMonth(new Date())}>TODAY</button><div><button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div><h2>{month.toLocaleDateString("en-MY", { month: "long", year: "numeric" }).toUpperCase()}</h2><button className="new-event-button" onClick={() => openCreate(new Date())}><Plus size={16} /> NEW EVENT</button></div>
        <section className="calendar-grid" aria-label={month.toLocaleDateString("en-MY", { month: "long", year: "numeric" })}>{["SUN","MON","TUE","WED","THU","FRI","SAT"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{days.map((date) => { const dayEntries = entries.filter((entry) => dateKey(entry.date) === dateKey(date)); const today = dateKey(date) === dateKey(new Date()); return <button className={`calendar-day${date.getMonth() !== month.getMonth() ? " outside" : ""}${today ? " today" : ""}`} key={date.toISOString()} onClick={() => { setSelectedDate(date); setEditing(null); }}><time>{date.getDate()}</time><span>{dayEntries.slice(0, 3).map((entry) => <i className={entry.kind} key={`${entry.kind}-${entry.id}`}><b>{entry.date.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false })}</b> {entry.title}</i>)}{dayEntries.length > 3 ? <small>+{dayEntries.length - 3} MORE</small> : null}</span></button>; })}</section>
        {selectedDate ? <aside className="calendar-drawer" aria-label="Selected day details"><div className="drawer-heading"><div><span className="eyebrow">{selectedDate.toLocaleDateString("en-MY", { weekday: "long" })}</span><h2>{selectedDate.toLocaleDateString("en-MY", { day: "2-digit", month: "long" })}</h2></div><button onClick={() => setSelectedDate(null)} aria-label="Close"><X size={19} /></button></div><button className="drawer-add" onClick={() => openCreate(selectedDate)}><Plus size={16} /> ADD EVENT</button>{selectedEntries.map((entry) => <article className={`drawer-entry ${entry.kind}`} key={`${entry.kind}-${entry.id}`}><time>{entry.date.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false })}</time><div><small>{entry.kind === "planner" ? "PLANNER DEADLINE" : "PERSONAL EVENT"}</small><strong>{entry.title}</strong><span><MapPin size={12} /> {entry.location}</span></div>{entry.source ? <><button onClick={() => openEdit(entry.source!)} aria-label={`Edit ${entry.title}`}><Pencil size={14} /></button><button onClick={() => void remove(entry.id)} aria-label={`Delete ${entry.title}`}><Trash2 size={14} /></button></> : null}</article>)}{(start || editing) ? <form className="calendar-event-form" onSubmit={(event) => void submit(event)}><h3>{editing ? "EDIT EVENT" : "NEW EVENT"}</h3><label><span>TITLE</span><input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label><span>START</span><input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required /></label><label><span>END</span><input type="datetime-local" min={start} value={end} onChange={(event) => setEnd(event.target.value)} required /></label><label><span>LOCATION</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label><button type="submit">{editing ? "SAVE CHANGES" : "CREATE EVENT"}</button></form> : null}</aside> : null}
      </>}
      {error ? <p className="data-error" role="alert">{error}</p> : null}
    </main>
  );
}
