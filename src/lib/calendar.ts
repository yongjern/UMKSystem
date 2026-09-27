import { calendar_v3, google } from "@googleapis/calendar";

export type CalendarEvent = {
  id: string;
  title: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
};

function normalizeEvent(event: calendar_v3.Schema$Event): CalendarEvent | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;

  if (!start || !end) return null;

  return {
    id: event.id ?? `${start}-${event.summary ?? "event"}`,
    title: event.summary ?? "Untitled event",
    location: event.location ?? "No location",
    start,
    end,
    allDay: !event.start?.dateTime,
  };
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Calendar credentials are not configured.");
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 8);

  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
    timeMin: now.toISOString(),
    timeMax: weekEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  return (response.data.items ?? [])
    .map(normalizeEvent)
    .filter((event): event is CalendarEvent => event !== null);
}