"use client";

import type { CalendarEvent } from "@/lib/calendar";
import { getSupabaseClient } from "@/lib/supabase";

const databaseName = "umk-dashboard";
const eventStoreName = "custom-events";
const plannerStoreName = "planner-items";
const legacyStorageKey = "umk-custom-events";

export type PlannerItem = {
  id: string;
  kind: "assignment" | "exam" | "revision";
  title: string;
  courseCode: string;
  dueAt: string;
  notes: string;
  hyperlink?: string;
  completed: boolean;
};

type StoredCalendarEvent = CalendarEvent;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(eventStoreName)) {
        request.result.createObjectStore(eventStoreName, { keyPath: "id" });
      }
      if (!request.result.objectStoreNames.contains(plannerStoreName)) {
        request.result.createObjectStore(plannerStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getLocalItems<T>(storeName: string): Promise<T[]> {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const request = transaction.objectStore(storeName).getAll();
  const items = await new Promise<T[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return items;
}

async function clearLocalItems(storeName: string) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).clear();
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

function throwIfError(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation}: ${error.message}`);
}

export async function migrateLocalData(userId: string) {
  const supabase = getSupabaseClient();
  const events = await getLocalItems<StoredCalendarEvent>(eventStoreName);
  const savedEvents = window.localStorage.getItem(legacyStorageKey);
  const legacyEvents = savedEvents ? JSON.parse(savedEvents) as StoredCalendarEvent[] : [];
  const allEvents = [...new Map([...events, ...legacyEvents].map((event) => [event.id, event])).values()];
  if (allEvents.length) {
    const { error } = await supabase.from("custom_events").upsert(
      allEvents.map((event) => ({
        id: event.id,
        user_id: userId,
        title: event.title,
        location: event.location,
        starts_at: event.start,
        ends_at: event.end || event.start,
        all_day: event.allDay,
      })),
      { onConflict: "user_id,id" },
    );
    throwIfError(error, "Unable to migrate saved events");
  }

  const plannerItems = await getLocalItems<PlannerItem>(plannerStoreName);
  if (plannerItems.length) {
    const { error } = await supabase.from("planner_items").upsert(
      plannerItems.map((item) => ({
        id: item.id,
        user_id: userId,
        kind: item.kind,
        title: item.title,
        course_code: item.courseCode,
        due_at: item.dueAt,
        notes: item.notes,
        hyperlink: item.hyperlink ?? null,
        completed: item.completed,
      })),
      { onConflict: "user_id,id" },
    );
    throwIfError(error, "Unable to migrate planner items");
  }

  if (allEvents.length || savedEvents) {
    await clearLocalItems(eventStoreName);
    window.localStorage.removeItem(legacyStorageKey);
  }
  if (plannerItems.length) await clearLocalItems(plannerStoreName);
}

export async function getCustomEvents(userId: string, now = new Date()) {
  const supabase = getSupabaseClient();
  const { error: cleanupError } = await supabase.from("custom_events").delete().eq("user_id", userId).lt("ends_at", now.toISOString());
  throwIfError(cleanupError, "Unable to remove expired events");

  const { data, error } = await supabase
    .from("custom_events")
    .select("id, title, location, starts_at, ends_at, all_day")
    .eq("user_id", userId)
    .gte("ends_at", now.toISOString())
    .order("starts_at");
  throwIfError(error, "Unable to load events");
  if (!data) throw new Error("Supabase returned no event data.");
  return data.map((event) => ({
    id: event.id,
    title: event.title,
    location: event.location,
    start: event.starts_at,
    end: event.ends_at,
    allDay: event.all_day,
  })) satisfies CalendarEvent[];
}

export async function addCustomEvent(event: CalendarEvent, userId: string) {
  const { error } = await getSupabaseClient().from("custom_events").insert({
    id: event.id,
    user_id: userId,
    title: event.title,
    location: event.location,
    starts_at: event.start,
    ends_at: event.end || event.start,
    all_day: event.allDay,
  });
  throwIfError(error, "Unable to save event");
}

export async function deleteCustomEvent(id: string, userId: string) {
  const { error } = await getSupabaseClient().from("custom_events").delete().eq("id", id).eq("user_id", userId);
  throwIfError(error, "Unable to delete event");
}

export async function getPlannerItems(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from("planner_items")
    .select("id, kind, title, course_code, due_at, notes, hyperlink, completed")
    .eq("user_id", userId)
    .order("due_at");
  throwIfError(error, "Unable to load planner items");
  if (!data) throw new Error("Supabase returned no planner data.");
  return data.map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    courseCode: item.course_code,
    dueAt: item.due_at,
    notes: item.notes,
    ...(item.hyperlink ? { hyperlink: item.hyperlink } : {}),
    completed: item.completed,
  })) satisfies PlannerItem[];
}

export async function savePlannerItem(item: PlannerItem, userId: string) {
  const { error } = await getSupabaseClient().from("planner_items").upsert({
    id: item.id,
    user_id: userId,
    kind: item.kind,
    title: item.title,
    course_code: item.courseCode,
    due_at: item.dueAt,
    notes: item.notes,
    hyperlink: item.hyperlink ?? null,
    completed: item.completed,
  }, { onConflict: "user_id,id" });
  throwIfError(error, "Unable to save planner item");
}

export async function deletePlannerItem(id: string, userId: string) {
  const { error } = await getSupabaseClient().from("planner_items").delete().eq("id", id).eq("user_id", userId);
  throwIfError(error, "Unable to delete planner item");
}
