/** Nama hari/bulan Melayu + pembantu masa mengikut zon waktu lokasi. */

export const MALAY_WEEKDAYS = [
  "AHAD",
  "ISNIN",
  "SELASA",
  "RABU",
  "KHAMIS",
  "JUMAAT",
  "SABTU",
];

export const MALAY_MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAC",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "OGO",
  "SEP",
  "OKT",
  "NOV",
  "DIS",
];

/** Bulan Hijrah 1-12 dalam ejaan Melayu. */
export const HIJRI_MONTHS = [
  "MUHARRAM",
  "SAFAR",
  "RABIULAWAL",
  "RABIULAKHIR",
  "JAMADILAWAL",
  "JAMADILAKHIR",
  "REJAB",
  "SYAABAN",
  "RAMADAN",
  "SYAWAL",
  "ZULKAEDAH",
  "ZULHIJJAH",
];

export function hijriMonthToMalay(monthNumber: number): string {
  return HIJRI_MONTHS[monthNumber - 1] ?? "";
}

export interface ZonedNow {
  hours: number;
  minutes: number;
  seconds: number;
  /** 0 = Ahad */
  weekday: number;
  day: number;
  month: number;
  year: number;
}

/** Komponen masa semasa dalam zon waktu tertentu (cth. "Asia/Kuala_Lumpur"). */
export function getZonedNow(timezone: string, base = new Date()): ZonedNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(base);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  // Intl memulangkan "24" pada tengah malam bagi sesetengah locale.
  const hours = Number(get("hour")) % 24;

  return {
    hours,
    minutes: Number(get("minute")),
    seconds: Number(get("second")),
    weekday: weekdayMap[get("weekday")] ?? 0,
    day: Number(get("day")),
    month: Number(get("month")),
    year: Number(get("year")),
  };
}

/** "01:15" -> { hour12: "1:15", period: "PM" } */
export function to12Hour(time24: string): { time: string; period: string } {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hour12}:${String(m).padStart(2, "0")}`, period };
}

/** Saat -> "HH:MM:SS" */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
