/**
 * Penyelesai lokasi berlapis untuk waktu solat.
 *
 * Turutan cubaan: cache segar -> GPS peranti -> geolokasi IP -> tekaan zon waktu.
 * Setiap lapisan ada had masa sendiri supaya UI tidak tergantung bila satu gagal.
 */

import { getFallbackLocation } from "@/lib/api/prayerTimes";

export type LocationSource = "gps" | "cache" | "ip" | "timezone";

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  source: LocationSource;
  /** Nama lokasi anggaran; null bila koordinat sebenar peranti */
  label: string | null;
  /** Ketepatan GPS dalam meter, bila ada */
  accuracyMeters?: number;
}

export interface ResolveOutcome {
  location: ResolvedLocation;
  /** true bila pengguna secara eksplisit menolak kebenaran lokasi */
  denied: boolean;
  /** Sebab GPS gagal, untuk mesej UI dan log */
  gpsError: string | null;
}

const COORDS_STORAGE_KEY = "eqariah_coords";
/** Koordinat dianggap segar selama 6 jam — pengguna jarang berpindah jauh. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const IP_LOOKUP_TIMEOUT_MS = 4000;

interface CachedCoords {
  latitude: number;
  longitude: number;
  savedAt: number;
}

function isFiniteCoord(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Tapis koordinat mustahil (0,0 di Teluk Guinea selalunya bug penyedia IP). */
function isPlausible(latitude: number, longitude: number): boolean {
  if (!isFiniteCoord(latitude) || !isFiniteCoord(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  if (latitude === 0 && longitude === 0) return false;
  return true;
}

export function readCachedCoords(): CachedCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COORDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCoords;
    if (!isPlausible(parsed?.latitude, parsed?.longitude)) return null;
    if (!isFiniteCoord(parsed?.savedAt)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function cacheCoords(latitude: number, longitude: number) {
  try {
    window.localStorage.setItem(
      COORDS_STORAGE_KEY,
      JSON.stringify({ latitude, longitude, savedAt: Date.now() })
    );
  } catch {
    // mod peribadi / storage penuh — bukan ralat maut
  }
}

export function clearCachedCoords() {
  try {
    window.localStorage.removeItem(COORDS_STORAGE_KEY);
  } catch {
    // abaikan
  }
}

/** Baca status kebenaran tanpa mencetuskan prompt. Null bila API tidak disokong. */
export async function getPermissionState(): Promise<PermissionState | null> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return null;
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return null;
  }
}

/**
 * Panggil `onChange` bila pengguna menukar kebenaran lokasi di tetapan pelayar,
 * supaya jadual boleh dimuat semula tanpa refresh manual.
 */
export function watchPermission(
  onChange: (state: PermissionState) => void
): () => void {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return () => {};
  }

  let status: PermissionStatus | null = null;
  const handler = () => status && onChange(status.state);

  navigator.permissions
    .query({ name: "geolocation" })
    .then((s) => {
      status = s;
      s.addEventListener("change", handler);
    })
    .catch(() => {});

  return () => status?.removeEventListener("change", handler);
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Kebenaran lokasi ditolak";
    case err.POSITION_UNAVAILABLE:
      return "Peranti tidak dapat menentukan lokasi";
    case err.TIMEOUT:
      return "Permintaan lokasi tamat masa";
    default:
      return "Ralat lokasi tidak diketahui";
  }
}

function getPosition(
  options: PositionOptions
): Promise<GeolocationPosition | GeolocationPositionError> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, resolve, options);
  });
}

function isPositionError(
  value: GeolocationPosition | GeolocationPositionError
): value is GeolocationPositionError {
  return "code" in value && !("coords" in value);
}

/**
 * Dua peringkat: cubaan pantas ketepatan rendah (biasanya guna WiFi/cache OS),
 * kemudian ketepatan tinggi bila yang pertama tamat masa. Ini mengelakkan
 * pengguna menunggu lama bila GPS lambat mengunci.
 */
async function tryGps(): Promise<
  { ok: true; position: GeolocationPosition } | { ok: false; error: GeolocationPositionError }
> {
  const attempts: PositionOptions[] = [
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 10 * 60 * 1000 },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  ];

  let lastError: GeolocationPositionError | null = null;

  for (const options of attempts) {
    const result = await getPosition(options);

    if (!isPositionError(result)) {
      return { ok: true, position: result };
    }

    lastError = result;
    // Kebenaran ditolak tidak akan berubah dengan cubaan semula.
    if (result.code === result.PERMISSION_DENIED) break;
  }

  return { ok: false, error: lastError as GeolocationPositionError };
}

interface IpProvider {
  url: string;
  parse: (json: Record<string, unknown>) => {
    latitude: number;
    longitude: number;
    label: string | null;
  } | null;
}

/** Penyedia percuma tanpa API key; dicuba mengikut turutan sehingga satu berjaya. */
const IP_PROVIDERS: IpProvider[] = [
  {
    url: "https://ipwho.is/",
    parse: (j) =>
      j.success === false
        ? null
        : {
            latitude: Number(j.latitude),
            longitude: Number(j.longitude),
            label: (j.city as string) ?? (j.country as string) ?? null,
          },
  },
  {
    url: "https://get.geojs.io/v1/ip/geo.json",
    parse: (j) => ({
      latitude: Number(j.latitude),
      longitude: Number(j.longitude),
      label: (j.city as string) ?? (j.country as string) ?? null,
    }),
  },
  {
    url: "https://ipapi.co/json/",
    parse: (j) =>
      j.error
        ? null
        : {
            latitude: Number(j.latitude),
            longitude: Number(j.longitude),
            label: (j.city as string) ?? (j.country_name as string) ?? null,
          },
  },
];

async function tryIpLookup(): Promise<ResolvedLocation | null> {
  for (const provider of IP_PROVIDERS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IP_LOOKUP_TIMEOUT_MS);

    try {
      const res = await fetch(provider.url, { signal: controller.signal });
      if (!res.ok) continue;

      const parsed = provider.parse(
        (await res.json()) as Record<string, unknown>
      );
      if (!parsed || !isPlausible(parsed.latitude, parsed.longitude)) continue;

      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        source: "ip",
        label: parsed.label,
      };
    } catch {
      // penyedia gagal / disekat — cuba yang seterusnya
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

function fromTimezone(): ResolvedLocation {
  const fallback = getFallbackLocation();
  return {
    latitude: fallback.latitude,
    longitude: fallback.longitude,
    source: "timezone",
    label: fallback.label,
  };
}

export interface ResolveOptions {
  /** Abaikan cache dan paksa cubaan GPS baharu (butang "Guna lokasi saya") */
  forceFresh?: boolean;
}

export async function resolveLocation(
  { forceFresh = false }: ResolveOptions = {}
): Promise<ResolveOutcome> {
  if (!forceFresh) {
    const cached = readCachedCoords();
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return {
        location: {
          latitude: cached.latitude,
          longitude: cached.longitude,
          source: "cache",
          label: null,
        },
        denied: false,
        gpsError: null,
      };
    }
  }

  const hasGeolocation =
    typeof navigator !== "undefined" && !!navigator.geolocation;
  // Geolokasi memerlukan konteks selamat (HTTPS atau localhost).
  const secure =
    typeof window === "undefined" ? false : window.isSecureContext !== false;

  let denied = false;
  let gpsError: string | null = null;

  if (hasGeolocation && secure) {
    const permission = await getPermissionState();

    if (permission === "denied") {
      denied = true;
      gpsError = "Kebenaran lokasi ditolak";
    } else {
      const result = await tryGps();

      if (result.ok) {
        const { latitude, longitude, accuracy } = result.position.coords;
        if (isPlausible(latitude, longitude)) {
          cacheCoords(latitude, longitude);
          return {
            location: {
              latitude,
              longitude,
              source: "gps",
              label: null,
              accuracyMeters: accuracy,
            },
            denied: false,
            gpsError: null,
          };
        }
        gpsError = "Koordinat peranti tidak munasabah";
      } else {
        denied = result.error.code === result.error.PERMISSION_DENIED;
        gpsError = geolocationErrorMessage(result.error);
      }
    }
  } else if (!secure) {
    gpsError = "Lokasi memerlukan sambungan selamat (HTTPS)";
  } else {
    gpsError = "Pelayar tidak menyokong geolokasi";
  }

  // GPS gagal — cache lapuk masih lebih baik daripada tekaan.
  const stale = readCachedCoords();
  if (stale) {
    return {
      location: {
        latitude: stale.latitude,
        longitude: stale.longitude,
        source: "cache",
        label: null,
      },
      denied,
      gpsError,
    };
  }

  const byIp = await tryIpLookup();
  if (byIp) return { location: byIp, denied, gpsError };

  return { location: fromTimezone(), denied, gpsError };
}
