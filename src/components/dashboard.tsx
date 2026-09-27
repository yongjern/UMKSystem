"use client";

import { ArrowUpRight, BookOpen, CalendarDays, Clock3, FileText, GraduationCap, MapPin, MessageCircle, Radio, Sparkles, Video, Wifi } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { quickLinks, type QuickLink } from "@/data/links";
import { classSchedule, dayNames, type ClassSession } from "@/data/schedule";
import type { CalendarEvent } from "@/lib/calendar";

const icons = { book: BookOpen, calendar: CalendarDays, campus: GraduationCap, file: FileText, message: MessageCircle, sparkles: Sparkles, video: Video, wifi: Wifi };
const timeSlots = Array.from({ length: 14 }, (_, index) => index + 8);

function formatHour(hour: number) {
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  return `${wholeHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function sessionDate(session: ClassSession, reference: Date, weekOffset = 0) {
  const date = new Date(reference);
  const daysAhead = (session.day - reference.getDay() + 7) % 7 + weekOffset * 7;
  date.setDate(reference.getDate() + daysAhead);
  date.setHours(Math.floor(session.start), Math.round((session.start % 1) * 60), 0, 0);
  return date;
}

function getNextSession(now: Date) {
  const candidates = classSchedule.flatMap((session) => {
    const start = sessionDate(session, now);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + (session.end - session.start) * 60);
    const nextWeekStart = sessionDate(session, now, 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setMinutes(nextWeekEnd.getMinutes() + (session.end - session.start) * 60);
    return [{ session, start, end }, { session, start: nextWeekStart, end: nextWeekEnd }];
  });
  return candidates.filter(({ end }) => end > now).sort((a, b) => a.start.getTime() - b.start.getTime())[0];
}

function countdownLabel(now: Date, start: Date, end: Date) {
  if (now >= start && now < end) return `NOW · ${Math.ceil((end.getTime() - now.getTime()) / 60000)} MIN LEFT`;
  const totalMinutes = Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return days > 0 ? `IN ${days}D ${hours}H` : `IN ${hours}H ${minutes}M`;
}

function QuickLinkCard({ link }: { link: QuickLink }) {
  const Icon = icons[link.icon];
  return (
    <a
      className="link-card"
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        if (link.campusOnly && !window.confirm("This system is only available on the UMK campus network. Open it anyway?")) {
          event.preventDefault();
        }
      }}
    >
      <span className="link-icon"><Icon size={20} strokeWidth={1.8} /></span>
      <span className="link-copy"><strong>{link.name}</strong><small>{link.description}</small></span>
      {link.campusOnly ? <span className="network-badge">CAMPUS ONLY</span> : null}
      <ArrowUpRight className="link-arrow" size={17} aria-hidden="true" />
    </a>
  );
}

function Timetable() {
  return (
    <div className="timetable-scroll">
      <table className="timetable">
        <colgroup><col className="day-column" />{timeSlots.map((hour) => <col key={hour} className="time-column" />)}</colgroup>
        <thead><tr><th scope="col">DAY</th>{timeSlots.map((hour) => <th scope="col" key={hour}>{hour.toString().padStart(2, "0")}</th>)}</tr></thead>
        <tbody>
          {dayNames.map((day, dayIndex) => {
            const sessions = classSchedule.filter((session) => session.day === dayIndex);
            const cells = [];
            let hour = 8;
            while (hour < 22) {
              const session = sessions.find((item) => item.start === hour);
              if (session) {
                const span = session.end - session.start;
                cells.push(<td className={`class-cell ${session.type.toLowerCase()}`} colSpan={span} key={`${day}-${hour}`}><strong>{session.code}</strong><span>{session.group} · {session.mode}</span></td>);
                hour += span;
              } else {
                cells.push(<td className="empty-cell" key={`${day}-${hour}`} aria-label={`${day} ${hour}:00 empty`} />);
                hour += 1;
              }
            }
            return <tr key={day}><th scope="row">{day.toUpperCase()}</th>{cells}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function Agenda({ now }: { now: Date }) {
  const [view, setView] = useState<"today" | "week">("today");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [source, setSource] = useState<"google" | "seed">("seed");
  useEffect(() => {
    fetch("/api/calendar").then((response) => response.json()).then((data: { events?: CalendarEvent[]; source?: "google" | "seed" }) => {
      if (data.events?.length) setEvents(data.events);
      if (data.source) setSource(data.source);
    }).catch(() => setSource("seed"));
  }, []);
  const seedEvents = classSchedule.filter((session) => view === "week" || session.day === now.getDay()).map((session) => ({ id: `${session.day}-${session.start}-${session.code}`, title: session.code, location: session.mode, start: sessionDate(session, now).toISOString(), end: "", allDay: false }));
  const visibleEvents = (source === "google" ? events : seedEvents).filter((event) => view === "week" || new Date(event.start).toDateString() === now.toDateString()).slice(0, 6);
  return (
    <section className="agenda" aria-labelledby="agenda-title">
      <div className="section-heading compact"><div><span className="eyebrow">AGENDA / {source === "google" ? "GOOGLE SYNC" : "LOCAL SCHEDULE"}</span><h2 id="agenda-title">Schedule view</h2></div><div className="view-toggle" aria-label="Agenda range"><button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>TODAY</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>WEEK</button></div></div>
      <div className="agenda-list">
        {visibleEvents.length ? visibleEvents.map((event) => { const start = new Date(event.start); return <div className="agenda-row" key={event.id}><time>{start.toLocaleDateString("en-MY", { weekday: "short" })}<strong>{start.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false })}</strong></time><span><strong>{event.title}</strong><small><MapPin size={13} /> {event.location}</small></span></div>; }) : <p className="empty-agenda">No events scheduled for today.</p>}
      </div>
    </section>
  );
}

export function Dashboard() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { const update = () => setNow(new Date()); update(); const timer = window.setInterval(update, 60000); return () => window.clearInterval(timer); }, []);
  const next = now ? getNextSession(now) : null;
  return (
    <main className="dashboard-shell">
      <header className="site-header"><div className="brand-lockup"><Image src="/logo.svg" alt="Universiti Malaysia Kelantan" width={184} height={72} priority /><div><span>PERSONAL OPERATIONS BOARD</span><h1>My UMK</h1></div></div><div className="live-clock" aria-label="Current date and time"><span><Radio size={12} fill="currentColor" /> LIVE</span><strong>{now ? now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"}</strong><small>{now ? now.toLocaleDateString("en-MY", { weekday: "long", day: "2-digit", month: "short" }).toUpperCase() : "LOADING"}</small></div></header>
      <div className="signal-divider" aria-hidden="true" />
      <section className="next-class" aria-labelledby="next-title"><div className="next-status"><span className="eyebrow"><Clock3 size={14} /> NEXT ON SCHEDULE</span><strong>{now && next ? countdownLabel(now, next.start, next.end) : "CALCULATING"}</strong></div><div className="next-main"><span className="day-number">{next ? next.start.getDate().toString().padStart(2, "0") : "--"}</span><div><h2 id="next-title">{next?.session.code ?? "Loading schedule"}</h2><p>{next ? `${next.session.type} · Group ${next.session.group}` : "Semester September · Session 2026/2027"}</p></div></div><div className="next-meta"><span><Clock3 size={15} /> {next ? `${formatHour(next.session.start)}—${formatHour(next.session.end)}` : "--:--"}</span><span><MapPin size={15} /> {next?.session.mode ?? "Checking"}</span></div></section>
      <div className="schedule-layout"><section className="timetable-section" aria-labelledby="timetable-title"><div className="section-heading"><div><span className="eyebrow">SEMESTER SEPTEMBER · 2026/2027</span><h2 id="timetable-title">Weekly timetable</h2></div><div className="legend"><span className="lecture-dot">LECTURE</span><span className="tutorial-dot">TUTORIAL</span></div></div><Timetable /></section>{now ? <Agenda now={now} /> : null}</div>
      <section className="links-section" aria-labelledby="links-title"><div className="section-heading"><div><span className="eyebrow">DIRECTORY / 12 DESTINATIONS</span><h2 id="links-title">Quick access</h2></div><p>Essential campus systems and everyday tools.</p></div><h3>Campus systems</h3><div className="links-grid">{quickLinks.filter((link) => link.category === "campus").map((link) => <QuickLinkCard link={link} key={link.name} />)}</div><h3>Everyday tools</h3><div className="links-grid tools-grid">{quickLinks.filter((link) => link.category === "tools").map((link) => <QuickLinkCard link={link} key={link.name} />)}</div></section>
      <footer><span>UMK PERSONAL DASHBOARD</span><span>SEMESTER 2026/2027</span></footer>
    </main>
  );
}