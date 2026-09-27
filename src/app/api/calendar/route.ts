import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/calendar";

export const revalidate = 600;

export async function GET() {
  try {
    const events = await getCalendarEvents();
    return NextResponse.json({ events, source: "google" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar unavailable.";
    return NextResponse.json({ events: [], source: "seed", message });
  }
}