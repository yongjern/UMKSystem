"use client";

import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { AccountButton } from "@/components/account-button";
import { dayNames, type ClassSession, type SessionType } from "@/data/schedule";
import { useAuth } from "@/lib/auth-context";
import { getDashboardConfig, type DashboardConfig } from "@/lib/dashboard-data";
import { deleteClassSession, initializePersonalTimetable, saveClassSession } from "@/lib/event-database";

const emptySession: ClassSession = { day: 1, start: 8, end: 10, code: "", group: "", type: "Lecture", mode: "" };

export function TimetableEditor() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [draft, setDraft] = useState<ClassSession>(emptySession);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const nextConfig = await getDashboardConfig(userId);
      setConfig(nextConfig);
      setDraft((current) => ({ ...current, code: current.code || nextConfig.courses[0]?.code || "" }));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load timetable.");
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  async function enableEditing() {
    if (!userId || !config) return;
    setSaving(true);
    try {
      await initializePersonalTimetable(userId, config.classSchedule);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your timetable.");
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !draft.code || draft.end <= draft.start) return;
    setSaving(true);
    try {
      await saveClassSession(draft, userId);
      setDraft({ ...emptySession, code: config?.courses[0]?.code ?? "" });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save class.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: ClassSession) {
    if (!userId || !item.id) return;
    try {
      await deleteClassSession(item.id, userId);
      if (draft.id === item.id) setDraft({ ...emptySession, code: config?.courses[0]?.code ?? "" });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete class.");
    }
  }

  return (
    <main className="editor-shell">
      <header className="planner-header">
        <Link href="/" className="back-link"><ArrowLeft size={17} /> DASHBOARD</Link>
        <div><span className="eyebrow">PERSONAL TIMETABLE</span><h1>BUILD YOUR WEEK.</h1></div>
        <AccountButton />
      </header>
      {!userId ? <section className="editor-gate"><h2>{authLoading ? "Checking sign-in…" : "Sign in to edit your timetable"}</h2><p>Every account has its own private timetable.</p><Link href="/login">SIGN IN</Link></section> : null}
      {userId && config && !config.isPersonalTimetable ? <section className="editor-gate"><span className="eyebrow">FIRST-TIME SETUP</span><h2>Make the default timetable yours</h2><p>This copies the current timetable into your private account. Changes will only be visible to you.</p><button onClick={() => void enableEditing()} disabled={saving}>COPY &amp; START EDITING</button></section> : null}
      {userId && config?.isPersonalTimetable ? <div className="editor-layout">
        <form className="timetable-form" onSubmit={(event) => void submit(event)}>
          <div><span className="eyebrow">{draft.id ? "EDIT CLASS" : "NEW CLASS"}</span><h2>{draft.id ? "Update this session" : "Add to your week"}</h2></div>
          <label><span>DAY</span><select value={draft.day} onChange={(event) => setDraft({ ...draft, day: Number(event.target.value) as ClassSession["day"] })}>{dayNames.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
          <label><span>COURSE</span><select value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })}>{config.courses.map((course) => <option value={course.code} key={course.code}>{course.code} · {course.name}</option>)}</select></label>
          <label><span>START HOUR</span><input type="number" min="0" max="23.5" step="0.5" value={draft.start} onChange={(event) => setDraft({ ...draft, start: Number(event.target.value) })} /></label>
          <label><span>END HOUR</span><input type="number" min="0.5" max="24" step="0.5" value={draft.end} onChange={(event) => setDraft({ ...draft, end: Number(event.target.value) })} /></label>
          <label><span>TYPE</span><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as SessionType })}><option>Lecture</option><option>Tutorial</option></select></label>
          <label><span>GROUP</span><input value={draft.group} onChange={(event) => setDraft({ ...draft, group: event.target.value })} required /></label>
          <label><span>LOCATION / MODE</span><input value={draft.mode} onChange={(event) => setDraft({ ...draft, mode: event.target.value })} required /></label>
          <div className="editor-actions"><button type="submit" disabled={saving}><Plus size={16} /> {draft.id ? "SAVE CHANGES" : "ADD CLASS"}</button>{draft.id ? <button type="button" className="secondary" onClick={() => setDraft({ ...emptySession, code: config.courses[0]?.code ?? "" })}>CANCEL</button> : null}</div>
        </form>
        <section className="session-list"><div><span className="eyebrow">YOUR WEEK</span><h2>{config.classSchedule.length} class sessions</h2></div>{config.classSchedule.length ? config.classSchedule.map((item) => <article key={item.id}><time>{dayNames[item.day]}<strong>{String(item.start).padStart(2, "0")}:00—{String(item.end).padStart(2, "0")}:00</strong></time><span><strong>{item.code}</strong><small>{item.type} · {item.group} · {item.mode}</small></span><button onClick={() => setDraft(item)} aria-label={`Edit ${item.code}`}><Pencil size={15} /></button><button onClick={() => void remove(item)} aria-label={`Delete ${item.code}`}><Trash2 size={15} /></button></article>) : <p>No classes yet.</p>}</section>
      </div> : null}
      {error ? <p className="data-error" role="alert">{error}</p> : null}
    </main>
  );
}
