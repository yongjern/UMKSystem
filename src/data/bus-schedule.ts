export type BusDirection = "toKampus" | "toKemumin";

export type BusRoute = {
  direction: BusDirection;
  from: string;
  to: string;
  shortLabel: string;
  departures: string[];
};