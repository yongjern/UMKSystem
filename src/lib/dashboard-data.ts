"use client";

import { getSupabaseClient } from "@/lib/supabase";
import type { BusDirection, BusRoute } from "@/data/bus-schedule";
import type { QuickLink } from "@/data/links";
import type { ClassSession, SessionType } from "@/data/schedule";

type CourseRow = {
  course_code: string;
  name: string;
  lecture_url: string | null;
  tutorial_url: string | null;
  meet_url: string | null;
};

type ClassSessionRow = {
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  course_code: string;
  group_code: string;
  session_type: SessionType;
  mode: string;
};

type QuickLinkRow = {
  id: string;
  name: string;
  description: string;
  url: string;
  category: QuickLink["category"];
  icon: QuickLink["icon"];
  campus_only: boolean;
};

type BusRouteRow = {
  direction: BusDirection;
  from_location: string;
  to_location: string;
  short_label: string;
};

type BusDepartureRow = {
  direction: BusDirection;
  departure_time: string;
  sort_order: number;
};

type OperatingDayRow = { day_of_week: number };

export type Course = {
  code: string;
  name: string;
  links: Partial<Record<SessionType, string>>;
  meetLink?: string;
};

export type DashboardConfig = {
  courses: Course[];
  classSchedule: ClassSession[];
  quickLinks: QuickLink[];
  busRoutes: BusRoute[];
  busOperatingDays: number[];
};

export async function getDashboardConfig(): Promise<DashboardConfig> {
  const supabase = getSupabaseClient();
  const [coursesResult, sessionsResult, linksResult, routesResult, departuresResult, daysResult] = await Promise.all([
    supabase.from("courses").select("*").order("course_code").returns<CourseRow[]>(),
    supabase.from("class_sessions").select("*").order("day_of_week").order("start_hour").returns<ClassSessionRow[]>(),
    supabase.from("quick_links").select("*").order("sort_order").returns<QuickLinkRow[]>(),
    supabase.from("bus_routes").select("*").order("direction").returns<BusRouteRow[]>(),
    supabase.from("bus_departures").select("*").order("sort_order").returns<BusDepartureRow[]>(),
    supabase.from("bus_operating_days").select("*").returns<OperatingDayRow[]>(),
  ]);

  const error = coursesResult.error ?? sessionsResult.error ?? linksResult.error ?? routesResult.error ?? departuresResult.error ?? daysResult.error;
  if (error) throw new Error(`Unable to load dashboard data: ${error.message}`);
  const coursesData = coursesResult.data;
  const sessionsData = sessionsResult.data;
  const linksData = linksResult.data;
  const routesData = routesResult.data;
  const departuresData = departuresResult.data;
  const daysData = daysResult.data;
  if (!coursesData || !sessionsData || !linksData || !routesData || !departuresData || !daysData) {
    throw new Error("Supabase returned incomplete dashboard data.");
  }

  const courses = coursesData.map((row) => ({
    code: row.course_code,
    name: row.name,
    links: {
      ...(row.lecture_url ? { Lecture: row.lecture_url } : {}),
      ...(row.tutorial_url ? { Tutorial: row.tutorial_url } : {}),
    },
    ...(row.meet_url ? { meetLink: row.meet_url } : {}),
  }));
  const departuresByRoute = new Map<BusDirection, string[]>();
  for (const departure of departuresData) {
    const items = departuresByRoute.get(departure.direction) ?? [];
    items.push(departure.departure_time.slice(0, 5));
    departuresByRoute.set(departure.direction, items);
  }

  return {
    courses,
    classSchedule: sessionsData.map((row) => ({
      day: row.day_of_week as ClassSession["day"],
      start: Number(row.start_hour),
      end: Number(row.end_hour),
      code: row.course_code,
      group: row.group_code,
      type: row.session_type,
      mode: row.mode,
    })),
    quickLinks: linksData.map((row) => ({
      name: row.name,
      description: row.description,
      url: row.url,
      category: row.category,
      icon: row.icon,
      campusOnly: row.campus_only,
    })),
    busRoutes: routesData.map((row) => ({
      direction: row.direction,
      from: row.from_location,
      to: row.to_location,
      shortLabel: row.short_label,
      departures: departuresByRoute.get(row.direction) ?? [],
    })),
    busOperatingDays: daysData.map((row) => row.day_of_week),
  };
}
