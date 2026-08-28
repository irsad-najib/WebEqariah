/**
 * Waktu solat + tarikh Hijrah dari Aladhan API (percuma, tanpa API key).
 * Docs: https://aladhan.com/prayer-times-api
 */

// 17 = JAKIM (Jabatan Kemajuan Islam Malaysia)
export const PRAYER_CALC_METHOD = 17;

export interface FallbackLocation {
  latitude: number;
  longitude: number;
  label: string;
}

/**
 * Lokasi anggaran bila geolokasi tidak tersedia, dipilih daripada zon waktu
 * peranti supaya pengguna Indonesia tidak jatuh ke jadual Malaysia.
 */
const TIMEZONE_FALLBACKS: Record<string, FallbackLocation> = {
  "Asia/Jakarta": { latitude: -7.7956, longitude: 110.3695, label: "Yogyakarta" },
  "Asia/Pontianak": { latitude: -0.0263, longitude: 109.3425, label: "Pontianak" },
  "Asia/Makassar": { latitude: -5.1477, longitude: 119.4327, label: "Makassar" },
  "Asia/Jayapura": { latitude: -2.5337, longitude: 140.7181, label: "Jayapura" },
  "Asia/Kuala_Lumpur": { latitude: 3.139, longitude: 101.6869, label: "Kuala Lumpur" },
  "Asia/Kuching": { latitude: 1.5533, longitude: 110.3592, label: "Kuching" },
  "Asia/Singapore": { latitude: 1.3521, longitude: 103.8198, label: "Singapura" },
  "Asia/Brunei": { latitude: 4.9031, longitude: 114.9398, label: "Bandar Seri Begawan" },
};

export const DEFAULT_FALLBACK: FallbackLocation = {
  latitude: 3.139,
  longitude: 101.6869,
  label: "Kuala Lumpur",
};

/** Teka lokasi daripada zon waktu peranti; DEFAULT_FALLBACK bila tidak dikenali. */
export function getFallbackLocation(): FallbackLocation {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_FALLBACKS[tz] ?? DEFAULT_FALLBACK;
  } catch {
    return DEFAULT_FALLBACK;
  }
}

export type PrayerKey =
  | "Fajr"
  | "Sunrise"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  Fajr: "SUBUH",
  Sunrise: "SYURUK",
  Dhuhr: "ZOHOR",
  Asr: "ASAR",
  Maghrib: "MAGHRIB",
  Isha: "ISYAK",
};

export const PRAYER_ORDER: PrayerKey[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

/** Syuruk bukan waktu solat fardhu — dikecualikan daripada kiraan "solat seterusnya". */
export const FARD_PRAYERS: PrayerKey[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export interface PrayerTimings {
  key: PrayerKey;
  label: string;
  /** Format 24 jam, cth. "13:15" */
  time24: string;
  /** Minit dari tengah malam, untuk pengiraan countdown */
  minutes: number;
}

export interface HijriDate {
  day: string;
  /** Nombor bulan Hijrah 1-12 (nama Inggeris Aladhan mengandungi diakritik) */
  monthNumber: number;
  year: string;
}

export interface PrayerTimesData {
  timings: PrayerTimings[];
  hijri: HijriDate;
  /** Tarikh Masihi (ISO, cth. "2026-06-25") mengikut zon waktu lokasi */
  gregorianISO: string;
  /** IANA timezone lokasi, cth. "Asia/Kuala_Lumpur" */
  timezone: string;
}

interface AladhanResponse {
  code: number;
  data: {
    timings: Record<string, string>;
    date: {
      gregorian: { date: string };
      hijri: { day: string; year: string; month: { number: number } };
    };
    meta: { timezone: string };
  };
}

/** Aladhan kadang memulangkan "05:49 (+08)" — ambil bahagian jam sahaja. */
function normalizeTime(raw: string): string {
  return raw.trim().split(" ")[0];
}

export function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<PrayerTimesData> {
  const url =
    `https://api.aladhan.com/v1/timings?latitude=${latitude}` +
    `&longitude=${longitude}&method=${PRAYER_CALC_METHOD}`;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Gagal memuat waktu solat (${res.status})`);
  }

  const json = (await res.json()) as AladhanResponse;
  if (json.code !== 200 || !json.data) {
    throw new Error("Respons waktu solat tidak sah");
  }

  const { timings, date, meta } = json.data;

  return {
    timings: PRAYER_ORDER.map((key) => {
      const time24 = normalizeTime(timings[key] ?? "00:00");
      return {
        key,
        label: PRAYER_LABELS[key],
        time24,
        minutes: timeToMinutes(time24),
      };
    }),
    hijri: {
      day: date.hijri.day,
      monthNumber: Number(date.hijri.month.number),
      year: date.hijri.year,
    },
    // Aladhan pulangkan "DD-MM-YYYY"
    gregorianISO: date.gregorian.date.split("-").reverse().join("-"),
    timezone: meta.timezone,
  };
}
