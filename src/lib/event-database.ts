import type { CalendarEvent } from "@/lib/calendar";

const databaseName = "umk-dashboard";
const storeName = "custom-events";
const plannerStoreName = "planner-items";
const legacyStorageKey = "umk-custom-events";

export type PlannerItem = {
  id: string;
  kind: "assignment" | "exam";
  title: string;
  courseCode: string;
  dueAt: string;
  notes: string;
  completed: boolean;
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName, { keyPath: "id" });
      }
      if (!request.result.objectStoreNames.contains(plannerStoreName)) {
        request.result.createObjectStore(plannerStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function completeTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function getCustomEvents(now = new Date()) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  const request = store.getAll();
  const events = await new Promise<CalendarEvent[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as CalendarEvent[]);
    request.onerror = () => reject(request.error);
  });
  const activeEvents = events.filter((event) => new Date(event.end || event.start) > now);
  events.filter((event) => !activeEvents.includes(event)).forEach((event) => store.delete(event.id));
  await completeTransaction(transaction);
  database.close();
  return activeEvents;
}

export async function addCustomEvent(event: CalendarEvent) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).put(event);
  await completeTransaction(transaction);
  database.close();
}

export async function deleteCustomEvent(id: string) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).delete(id);
  await completeTransaction(transaction);
  database.close();
}

export async function migrateLegacyEvents() {
  const savedEvents = window.localStorage.getItem(legacyStorageKey);
  if (!savedEvents) return;
  const events = JSON.parse(savedEvents) as CalendarEvent[];
  await Promise.all(events.map(addCustomEvent));
  window.localStorage.removeItem(legacyStorageKey);
}

export async function getPlannerItems() {
  const database = await openDatabase();
  const transaction = database.transaction(plannerStoreName, "readonly");
  const request = transaction.objectStore(plannerStoreName).getAll();
  const items = await new Promise<PlannerItem[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as PlannerItem[]);
    request.onerror = () => reject(request.error);
  });
  await completeTransaction(transaction);
  database.close();
  return items.sort((first, second) => new Date(first.dueAt).getTime() - new Date(second.dueAt).getTime());
}

export async function savePlannerItem(item: PlannerItem) {
  const database = await openDatabase();
  const transaction = database.transaction(plannerStoreName, "readwrite");
  transaction.objectStore(plannerStoreName).put(item);
  await completeTransaction(transaction);
  database.close();
}

export async function deletePlannerItem(id: string) {
  const database = await openDatabase();
  const transaction = database.transaction(plannerStoreName, "readwrite");
  transaction.objectStore(plannerStoreName).delete(id);
  await completeTransaction(transaction);
  database.close();
}