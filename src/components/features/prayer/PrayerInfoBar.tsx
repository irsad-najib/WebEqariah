"use client";

import { usePrayerTimes } from "@/lib/hooks/usePrayerTimes";
import { usePrayerClock } from "@/lib/hooks/usePrayerClock";
import { CurrentTimeBoard } from "./CurrentTimeBoard";
import { DateBoard } from "./DateBoard";
import { LocationNotice } from "./LocationNotice";
import { PrayerScheduleBoard } from "./PrayerScheduleBoard";

/**
 * Bar maklumat waktu solat, jam semasa dan tarikh Masihi/Hijrah,
 * mengikut lokasi pengguna.
 */
export function PrayerInfoBar() {
  const {
    data,
    loading,
    error,
    source,
    locationLabel,
    permissionDenied,
    gpsError,
    refresh,
  } = usePrayerTimes();
  const clock = usePrayerClock(data);

  if (loading || (!data && !error)) {
    return (
      <div className="mx-auto flex w-full max-w-screen-2xl px-4 py-4">
        <div className="h-[120px] w-full animate-pulse rounded-md bg-emerald-900/30" />
      </div>
    );
  }

  if (error || !data || !clock) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-4">
        <div className="flex items-center justify-between gap-3 rounded-md border border-amber-200/40 bg-emerald-950/40 px-4 py-3 text-sm text-amber-100">
          <span>{error ?? "Waktu solat tidak tersedia buat masa ini."}</span>
          <button
            onClick={() => refresh(true)}
            className="rounded border border-amber-300/60 px-3 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-300 hover:text-emerald-900"
          >
            Cuba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
        <PrayerScheduleBoard data={data} highlightLabel={clock.nextPrayerLabel} />
        <CurrentTimeBoard clock={clock} />
        <DateBoard data={data} clock={clock} />
      </div>

      <LocationNotice
        source={source}
        locationLabel={locationLabel}
        permissionDenied={permissionDenied}
        gpsError={gpsError}
        loading={loading}
        onRetry={() => refresh(true)}
      />
    </div>
  );
}
