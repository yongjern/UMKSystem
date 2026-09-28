"use client";

import { ArrowRight, ArrowUpRight, Bell, BellRing, BookOpen, BusFront, CalendarDays, Check, ClipboardList, Clock3, Download, ExternalLink, FileText, GraduationCap, MapPin, MessageCircle, MoonStar, Plus, Radio, Sparkles, Trash2, Video, Wifi } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { quickLinks, type QuickLink } from "@/data/links";
import { busOperatingDays, busRoutes, type BusDirection } from "@/data/bus-schedule";
import { classSchedule, courseLinks, courseMeetLinks, courseNames, dayNames, type ClassSession } from "@/data/schedule";
import { addCustomEvent as addEventToDatabase, deleteCustomEvent, getCustomEvents, getPlannerItems, migrateLegacyEvents, savePlannerItem, type PlannerItem } from "@/lib/event-database";
import type { CalendarEvent } from "@/lib/calendar";

const icons = { book: BookOpen, calendar: CalendarDays, campus: GraduationCap, file: FileText, message: MessageCircle, sparkles: Sparkles, video: Video, wifi: Wifi };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
const timeSlots = Array.from({ length: 14 }, (_, index) => index + 8);
const courseColors: Record<string, { background: string; accent: string }> = {
  UBI2022: { background: "#42220b", accent: "#ffb13d" },
  HTP10103: { background: "#102d37", accent: "#35c2d1" },
  HFT10103: { background: "#401421", accent: "#ff3b57" },
  ATF10203: { background: "#2f2045", accent: "#b58cff" },
  USK10602: { background: "#143326", accent: "#58d68d" },
  UKS10401: { background: "#3d2912", accent: "#f5cf62" },
  HFT10403: { background: "#222c51", accent: "#7f9cff" },
};

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

function getNextPhysicalSession(now: Date) {
  const candidates = classSchedule
    .filter((session) => !/^(Online|Async)/i.test(session.mode))
    .flatMap((session) => [sessionDate(session, now), sessionDate(session, now, 1)].map((start) => ({ session, start })))
    .filter(({ start }) => start > now)
    .sort((first, second) => first.start.getTime() - second.start.getTime());
  return candidates[0];
}

function getRecommendedBus(now: Date) {
  const nextClass = getNextPhysicalSession(now);
  if (!nextClass || !busOperatingDays.includes(nextClass.start.getDay() as (typeof busOperatingDays)[number])) return null;
  const route = busRoutes.find((item) => item.direction === "toKampus") ?? busRoutes[0];
  const arrivalCutoff = new Date(nextClass.start.getTime() - 45 * 60000);
  const departures = route.departures.map((departure) => {
    const [hours, minutes] = departure.split(":").map(Number);
    const departureDate = new Date(nextClass.start);
    departureDate.setHours(hours, minutes, 0, 0);
    return { departure, departureDate };
  }).filter(({ departureDate }) => departureDate > now && departureDate <= arrivalCutoff);
  const bus = departures.at(-1);
  return bus ? { ...bus, nextClass } : null;
}

function countdownLabel(now: Date, start: Date, end: Date) {
  if (now >= start && now < end) return `NOW · ${Math.ceil((end.getTime() - now.getTime()) / 60000)} MIN LEFT`;
  const totalMinutes = Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return days > 0 ? `IN ${days}D ${hours}H` : `IN ${hours}H ${minutes}M`;
}

function isTomorrow(now: Date, date: Date) {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return tomorrow.toDateString() === date.toDateString();
}

function getNextBus(now: Date, direction: BusDirection) {
  const route = busRoutes.find((item) => item.direction === direction) ?? busRoutes[0];
  for (let dayOffset = 0; dayOffset < 8; dayOffset += 1) {
    const serviceDate = new Date(now);
    serviceDate.setDate(now.getDate() + dayOffset);
    if (!busOperatingDays.includes(serviceDate.getDay() as (typeof busOperatingDays)[number])) continue;
    for (const departure of route.departures) {
      const [hours, minutes] = departure.split(":").map(Number);
      const departureDate = new Date(serviceDate);
      departureDate.setHours(hours, minutes, 0, 0);
      if (departureDate > now) return { route, departure, departureDate };
    }
  }
  return null;
}

function busCountdown(now: Date, departure: Date) {
  const totalMinutes = Math.max(0, Math.ceil((departure.getTime() - now.getTime()) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}D ${hours}H`;
  if (hours > 0) return `${hours}H ${minutes}M`;
  return `${minutes} MIN`;
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

function Timetable({ now }: { now: Date }) {
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const selectedCourseLink = selectedSession ? courseLinks[selectedSession.code]?.[selectedSession.type] : undefined;
  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const showTimeLine = currentHour >= 8 && currentHour < 22;
  const linePosition = 7.5 + ((currentHour - 8) / 14) * 92.5;
  return (
    <div className="timetable-block">
      <div className="timetable-scroll">
        <div className="timetable-canvas">
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
                const colors = courseColors[session.code];
                cells.push(<td className="class-cell" style={{ backgroundColor: colors.background, borderLeftColor: colors.accent }} colSpan={span} key={`${day}-${hour}`} tabIndex={0} onMouseEnter={() => setSelectedSession(session)} onFocus={() => setSelectedSession(session)} onClick={() => setSelectedSession(session)} aria-label={`${session.code}, ${courseNames[session.code]}, ${session.type}, group ${session.group}, ${formatHour(session.start)} to ${formatHour(session.end)}, ${session.mode}`}><strong>{session.code}</strong><span>{session.group} · {session.mode}</span></td>);
                hour += span;
              } else {
                cells.push(<td className="empty-cell" key={`${day}-${hour}`} aria-label={`${day} ${hour}:00 empty`} />);
                hour += 1;
              }
            }
            return <tr className={dayIndex === now.getDay() ? "today-row" : ""} key={day}><th scope="row">{day.toUpperCase()}</th>{cells}</tr>;
          })}
        </tbody>
        </table>
        {showTimeLine ? <div className="current-time-line" style={{ left: `${linePosition}%` }} aria-label={`Current time ${formatHour(currentHour)}`}><span>{formatHour(currentHour)}</span></div> : null}
        </div>
      </div>
      <div className={`course-details${selectedSession ? " active" : ""}`} aria-live="polite">
        {selectedSession ? <><div><span className="eyebrow">{selectedSession.code} / {selectedSession.type.toUpperCase()}</span><strong>{courseNames[selectedSession.code]}</strong></div><dl><div><dt>GROUP</dt><dd>{selectedSession.group}</dd></div><div><dt>TIME</dt><dd>{formatHour(selectedSession.start)}—{formatHour(selectedSession.end)}</dd></div><div><dt>LOCATION</dt><dd>{selectedSession.mode}</dd></div></dl>{selectedCourseLink ? <a className="course-link" href={selectedCourseLink} target="_blank" rel="noreferrer">E-CAMPUS <ArrowUpRight size={15} /></a> : null}</> : <p>Hover, focus, or tap a class to view its details.</p>}
      </div>
    </div>
  );
}

function BusSchedule({ now }: { now: Date }) {
  const recommendedBus = getRecommendedBus(now);

  return (
    <section className="bus-section" aria-labelledby="bus-title">
      <div className="section-heading bus-heading">
        <div><span className="eyebrow">SUNDAY—THURSDAY / SHUTTLE</span><h2 id="bus-title">Kampus Kota bus</h2></div>
      </div>
      <div className="bus-board">
        <div className="bus-directions">
          {busRoutes.map((route) => {
            const nextBus = getNextBus(now, route.direction);
            const isLastBus = Boolean(nextBus && nextBus.departure === route.departures.at(-1));
            return <div className="bus-direction" key={route.direction}>
              <div className={`next-bus-panel${isLastBus ? " last-bus" : ""}`}>
                <span className="bus-icon"><BusFront size={25} /></span>
                <div className="bus-route"><small>{isLastBus ? "LAST DEPARTURE" : "NEXT DEPARTURE"}</small><strong>{route.from} <ArrowRight size={18} /> {route.to}</strong></div>
                <time>{nextBus?.departure ?? "--:--"}<small>{nextBus ? `${isLastBus ? "LAST BUS · " : ""}IN ${busCountdown(now, nextBus.departureDate)}` : "NO SERVICE"}</small></time>
              </div>
              {route.direction === "toKampus" && recommendedBus ? <div className="class-bus-advice"><Bell size={16} /><span><strong>LEAVE FOR {recommendedBus.nextClass.session.code}</strong>Take the {recommendedBus.departure} bus for the {formatHour(recommendedBus.nextClass.session.start)} class at {recommendedBus.nextClass.session.mode}.</span><small>45 MIN BUFFER</small></div> : null}
            </div>;
          })}
        </div>
        <p>Service times are based on the UMK schedule issued 11 March 2026 and may change during public holidays.</p>
      </div>
    </section>
  );
}

function Agenda({ now }: { now: Date }) {
  const [view, setView] = useState<"today" | "week">("today");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [source, setSource] = useState<"google" | "seed">("seed");
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");
  useEffect(() => {
    fetch("/api/calendar").then((response) => response.json()).then((data: { events?: CalendarEvent[]; source?: "google" | "seed" }) => {
      if (data.events?.length) setEvents(data.events);
      if (data.source) setSource(data.source);
    }).catch(() => setSource("seed"));
    const loadEvents = async () => {
      try {
        await migrateLegacyEvents();
        setCustomEvents(await getCustomEvents());
        setPlannerItems(await getPlannerItems());
      } catch {
        setCustomEvents([]);
        setPlannerItems([]);
      }
    };
    void loadEvents();
    const cleanupTimer = window.setInterval(() => void loadEvents(), 60000);
    return () => window.clearInterval(cleanupTimer);
  }, []);

  async function addCustomEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !dateTime || !endDateTime) return;
    const start = new Date(dateTime).toISOString();
    const end = new Date(endDateTime).toISOString();
    if (new Date(end) <= new Date(start)) return;
    const customEvent: CalendarEvent = {
      id: `custom-${crypto.randomUUID()}`,
      title: title.trim(),
      location: location.trim() || "No location",
      start,
      end,
      allDay: false,
    };
    await addEventToDatabase(customEvent);
    setCustomEvents((currentEvents) => [...currentEvents, customEvent]);
    setTitle("");
    setDateTime("");
    setEndDateTime("");
    setLocation("");
  }

  async function removeCustomEvent(id: string) {
    await deleteCustomEvent(id);
    setCustomEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
  }

  async function completePlannerItem(item: PlannerItem) {
    const completedItem = { ...item, completed: true };
    await savePlannerItem(completedItem);
    setPlannerItems((currentItems) => currentItems.map((currentItem) => currentItem.id === item.id ? completedItem : currentItem));
  }

  const seedEvents = classSchedule.filter((session) => view === "week" || session.day === now.getDay()).map((session) => ({ id: `${session.day}-${session.start}-${session.code}`, title: session.code, location: session.mode, start: sessionDate(session, now).toISOString(), end: "", allDay: false }));
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  const visibleEvents = [...(source === "google" ? events : seedEvents), ...customEvents]
    .filter((event) => view === "today" ? new Date(event.start).toDateString() === now.toDateString() : new Date(event.start) >= now && new Date(event.start) < weekEnd)
    .sort((first, second) => new Date(first.start).getTime() - new Date(second.start).getTime());
  const visiblePlannerItems = plannerItems.filter((item) => !item.completed);
  return (
    <section className="agenda" aria-labelledby="agenda-title">
      <div className="section-heading compact"><div><span className="eyebrow">AGENDA / {source === "google" ? "GOOGLE SYNC" : "LOCAL SCHEDULE"}</span><h2 id="agenda-title">Schedule view</h2></div><div className="view-toggle" aria-label="Agenda range"><button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>TODAY</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>WEEK</button></div></div>
      <form className="event-form" onSubmit={addCustomEvent}>
        <label><span>EVENT</span><input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Event title" required /></label>
        <label><span>START</span><input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} required /></label>
        <label><span>END</span><input type="datetime-local" min={dateTime} value={endDateTime} onChange={(event) => setEndDateTime(event.target.value)} required /></label>
        <label><span>LOCATION</span><input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional" /></label>
        <button type="submit" title="Add event"><Plus size={18} /><span>ADD EVENT</span></button>
      </form>
      <div className="agenda-list">
        {visibleEvents.length ? visibleEvents.map((event) => { const start = new Date(event.start); const isCustom = event.id.startsWith("custom-"); return <div className="agenda-row" key={event.id}><time>{start.toLocaleDateString("en-MY", { weekday: "short" })}<strong>{start.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false })}</strong></time><span><strong>{event.title}</strong><small><MapPin size={13} /> {event.location}</small></span>{isCustom ? <button className="delete-event" onClick={() => removeCustomEvent(event.id)} title="Delete event" aria-label={`Delete ${event.title}`}><Trash2 size={15} /></button> : null}</div>; }) : <p className="empty-agenda">No events scheduled for this view.</p>}
      </div>
      <div className="agenda-planner">
        <div className="agenda-planner-heading"><span><ClipboardList size={15} /> PLANNER</span><Link href="/planner">MANAGE <ArrowRight size={13} /></Link></div>
        {visiblePlannerItems.length ? visiblePlannerItems.map((item) => { const dueAt = new Date(item.dueAt); return <div className={`agenda-planner-row${dueAt <= now ? " overdue" : ""}`} key={item.id}><button onClick={() => void completePlannerItem(item)} aria-label={`Complete ${item.title}`} title="Mark complete"><Check size={14} /></button><span><small>{item.kind.toUpperCase()} · {item.courseCode}</small><strong>{item.title}</strong></span><time dateTime={item.dueAt}>{dueAt.toLocaleDateString("en-MY", { day: "2-digit", month: "short" })}<strong>{dueAt.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false })}</strong></time></div>; }) : <p className="empty-planner-agenda">No open planner deadlines.</p>}
      </div>
    </section>
  );
}

export function Dashboard() {
  const [now, setNow] = useState<Date | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  useEffect(() => { const update = () => setNow(new Date()); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if ("Notification" in window) setNotificationsEnabled(Notification.permission === "granted" && window.localStorage.getItem("umk-class-notifications") === "enabled");
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
    const captureInstallPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
  }, []);
  const next = now ? getNextSession(now) : null;
  const showGoodNight = Boolean(now && next && isTomorrow(now, next.start));
  const nextCourseLink = next ? courseLinks[next.session.code]?.[next.session.type] : undefined;
  const nextMeetLink = next ? courseMeetLinks[next.session.code] : undefined;
  useEffect(() => {
    if (!("Notification" in window) || !now || !next || !notificationsEnabled || Notification.permission !== "granted" || now >= next.start) return;
    const minutes = Math.ceil((next.start.getTime() - now.getTime()) / 60000);
    const threshold = minutes <= 10 ? 10 : minutes <= 30 ? 30 : null;
    if (!threshold) return;
    const notificationKey = `umk-notified-${next.session.code}-${next.start.toISOString()}-${threshold}`;
    if (window.localStorage.getItem(notificationKey)) return;
    const notification = new Notification(`${next.session.code} starts in ${minutes} minutes`, { body: `${next.session.type} · ${next.session.mode} · ${formatHour(next.session.start)}`, icon: "/logo.svg", tag: notificationKey });
    notification.onclick = () => { window.focus(); if (nextMeetLink) window.open(nextMeetLink, "_blank", "noopener,noreferrer"); };
    window.localStorage.setItem(notificationKey, "sent");
  }, [next, nextMeetLink, notificationsEnabled, now]);

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setNotificationsEnabled(enabled);
    if (enabled) window.localStorage.setItem("umk-class-notifications", "enabled");
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }
  return (
    <main className="dashboard-shell">
      <header className="site-header"><div className="brand-lockup"><Image src="https://corporate.umk.edu.my/download/logo%20UMK%20(Menegak)_1bu43dewg9ja8.png" alt="Universiti Malaysia Kelantan" width={596} height={843} priority unoptimized /><div><span>PERSONAL OPERATIONS BOARD</span><h1>My UMK</h1></div></div><div className="live-clock" aria-label="Current date and time"><span><Radio size={12} fill="currentColor" /> LIVE</span><strong>{now ? now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}</strong><small>{now ? now.toLocaleDateString("en-MY", { weekday: "long", day: "2-digit", month: "short" }).toUpperCase() : "LOADING"}</small></div></header>
      <div className="signal-divider" aria-hidden="true" />
      <nav className="dashboard-tools" aria-label="Dashboard tools"><Link href="/planner"><ClipboardList size={16} /> PLANNER</Link><button onClick={() => void enableNotifications()} className={notificationsEnabled ? "active" : ""}>{notificationsEnabled ? <BellRing size={16} /> : <Bell size={16} />} {notificationsEnabled ? "REMINDERS ON" : "CLASS REMINDERS"}</button>{installPrompt ? <button onClick={() => void installApp()}><Download size={16} /> INSTALL APP</button> : null}</nav>
      {showGoodNight ? <section className="next-class good-night" aria-labelledby="next-title"><div className="night-icon"><MoonStar size={38} /></div><div className="next-main"><h2 id="next-title">晚安，明天見。</h2></div></section> : <section className="next-class" aria-labelledby="next-title"><div className="next-status"><span className="eyebrow"><Clock3 size={14} /> NEXT ON SCHEDULE</span><strong>{now && next ? countdownLabel(now, next.start, next.end) : "CALCULATING"}</strong></div><div className="next-main"><span className="day-number">{next ? next.start.getDate().toString().padStart(2, "0") : "--"}</span><div><h2 id="next-title">{next?.session.code ?? "Loading schedule"}</h2><p>{next ? `${next.session.type} · Group ${next.session.group}` : "Semester September · Session 2026/2027"}</p></div></div><div className="next-meta"><span><Clock3 size={15} /> {next ? `${formatHour(next.session.start)}—${formatHour(next.session.end)}` : "--:--"}</span><span><MapPin size={15} /> {next?.session.mode ?? "Checking"}</span>{next && (nextMeetLink || nextCourseLink) ? <div className="next-actions">{nextMeetLink ? <a className="meet-action" href={nextMeetLink} target="_blank" rel="noreferrer" aria-label={`Join ${next.session.code} Google Meet`}><Video size={15} /> JOIN MEET</a> : null}{nextCourseLink ? <a href={nextCourseLink} target="_blank" rel="noreferrer" aria-label={`Open ${next.session.code} on e-Campus`}><ExternalLink size={15} /> E-CAMPUS</a> : null}</div> : null}</div></section>}
      <div className="schedule-layout"><section className="timetable-section" aria-labelledby="timetable-title"><div className="section-heading"><div><span className="eyebrow">SEMESTER SEPTEMBER · 2026/2027</span><h2 id="timetable-title">Weekly timetable</h2></div><div className="legend"><span className="lecture-dot">LECTURE</span><span className="tutorial-dot">TUTORIAL</span></div></div>{now ? <Timetable now={now} /> : null}</section>{now ? <Agenda now={now} /> : null}</div>
      {now ? <BusSchedule now={now} /> : null}
      <section className="links-section" aria-labelledby="links-title"><div className="section-heading"><div><span className="eyebrow">DIRECTORY / 12 DESTINATIONS</span><h2 id="links-title">Quick access</h2></div><p>Essential campus systems and everyday tools.</p></div><h3>Campus systems</h3><div className="links-grid">{quickLinks.filter((link) => link.category === "campus").map((link) => <QuickLinkCard link={link} key={link.name} />)}</div><h3>Everyday tools</h3><div className="links-grid tools-grid">{quickLinks.filter((link) => link.category === "tools").map((link) => <QuickLinkCard link={link} key={link.name} />)}</div></section>
      <footer><span>UMK PERSONAL DASHBOARD</span><span>SEMESTER 2026/2027</span></footer>
    </main>
  );
}