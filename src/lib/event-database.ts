import type { CalendarEvent } from "@/lib/calendar";

const databaseName = "umk-dashboard";
const storeName = "custom-events";
const legacyStorageKey = "umk-custom-events";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName, { keyPath: "id" });
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