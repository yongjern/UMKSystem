export type BusDirection = "toKampus" | "toKemumin";

export type BusRoute = {
  direction: BusDirection;
  from: string;
  to: string;
  shortLabel: string;
  departures: string[];
};

export const busOperatingDays = [0, 1, 2, 3, 4] as const;

export const busRoutes: BusRoute[] = [
  {
    direction: "toKampus",
    from: "Kemumin",
    to: "Kampus Kota",
    shortLabel: "TO KAMPUS",
    departures: [
      "07:20", "07:40", "08:20", "09:00", "10:20", "11:10", "12:00",
      "12:40", "13:30", "15:20", "16:00", "17:20", "18:00", "18:40",
      "20:00", "22:40",
    ],
  },
  {
    direction: "toKemumin",
    from: "Kampus Kota",
    to: "Kemumin",
    shortLabel: "TO KEMUMIN",
    departures: [
      "08:00", "08:40", "09:40", "11:00", "11:40", "12:20", "13:00",
      "14:00", "15:40", "17:00", "17:40", "18:20", "19:00", "22:20",
      "23:00",
    ],
  },
];