export type SessionType = "Lecture" | "Tutorial";

export type ClassSession = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start: number;
  end: number;
  code: string;
  group: string;
  type: SessionType;
  mode: string;
};

export const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;