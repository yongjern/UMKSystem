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

export const courseNames: Record<string, string> = {
  ATF10203: "ASAS KEUSAHAWANAN",
  HFT10103: "ASAS PENGURUSAN",
  HFT10403: "PRINSIP EKONOMI",
  HTP10103: "PENGENALAN KEPADA INDUSTRI KEUSAHAWANAN PELANCONGAN",
  UBI2022: "BAHASA INGGERIS DALAM KOMUNIKASI PERNIAGAAN",
  UKS10401: "BADMINTON",
  USK10602: "FALSAFAH DAN CABARAN SEMASA",
};

export const courseLinks: Record<string, Partial<Record<SessionType, string>>> = {
  ATF10203: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111126122",
    Tutorial: "https://ecampus.umk.edu.my/course/view.php?id=111126123",
  },
  HFT10103: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111127150",
    Tutorial: "https://ecampus.umk.edu.my/course/view.php?id=111127151",
  },
  HFT10403: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111127162",
    Tutorial: "https://ecampus.umk.edu.my/course/view.php?id=111127163",
  },
  HTP10103: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111127392",
    Tutorial: "https://ecampus.umk.edu.my/course/view.php?id=111127393",
  },
  UBI2022: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111128263",
  },
  UKS10401: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111128565",
  },
  USK10602: {
    Lecture: "https://ecampus.umk.edu.my/course/view.php?id=111128828",
  },
};

export const courseMeetLinks: Partial<Record<string, string>> = {
  ATF10203: "https://meet.google.com/cxf-dvjn-wtt",
  USK10602: "https://meet.google.com/gkf-qori-fjy",
};

export const classSchedule: ClassSession[] = [
  { day: 0, start: 8, end: 10, code: "UBI2022", group: "PC20", type: "Lecture", mode: "Online 10K" },
  { day: 0, start: 10, end: 11, code: "HTP10103", group: "L1T1", type: "Tutorial", mode: "Online 1K" },
  { day: 0, start: 11, end: 13, code: "HFT10103", group: "L1", type: "Lecture", mode: "K202D" },
  { day: 0, start: 16, end: 18, code: "ATF10203", group: "H1", type: "Lecture", mode: "Online 8K" },
  { day: 0, start: 20, end: 21, code: "HFT10103", group: "L1T1", type: "Tutorial", mode: "Async_1" },
  { day: 1, start: 14, end: 16, code: "USK10602", group: "PC15", type: "Lecture", mode: "Online 5K" },
  { day: 2, start: 17, end: 19, code: "UKS10401", group: "LK1", type: "Lecture", mode: "K204D" },
  { day: 3, start: 8, end: 10, code: "HTP10103", group: "L1", type: "Lecture", mode: "K204D" },
  { day: 3, start: 10, end: 11, code: "HFT10403", group: "L1T1", type: "Tutorial", mode: "Online 1K" },
  { day: 4, start: 8, end: 10, code: "HFT10403", group: "L1", type: "Lecture", mode: "K202D" },
];