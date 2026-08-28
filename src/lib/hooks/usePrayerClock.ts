"use client";

import { useEffect, useState } from "react";
import { FARD_PRAYERS, type PrayerTimesData } from "@/lib/api/prayerTimes";
import { getZonedNow, type ZonedNow } from "@/lib/utils/islamicDate";

export interface PrayerClock {
  now: ZonedNow;
  /** Solat fardhu seterusnya (kembali ke Subuh esok selepas Isyak) */
  nextPrayerLabel: string;
  nextPrayerTime24: string;
  /** Baki masa dalam saat sehingga solat seterusnya */
  remainingSeconds: number;
}

/** Tik setiap saat mengikut zon waktu lokasi, dan kira solat seterusnya. */
export function usePrayerClock(data: PrayerTimesData | null): PrayerClock | null {
  const timezone =
    data?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [now, setNow] = useState<ZonedNow | null>(null);

  useEffect(() => {
    const update = () => setNow(getZonedNow(timezone));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [timezone]);

  if (!now || !data) return null;

  const nowSeconds = now.hours * 3600 + now.minutes * 60 + now.seconds;
  const fard = data.timings.filter((t) => FARD_PRAYERS.includes(t.key));

  let next = fard.find((t) => t.minutes * 60 > nowSeconds);
  let targetSeconds: number;

  if (next) {
    targetSeconds = next.minutes * 60;
  } else {
    // Selepas Isyak — solat seterusnya ialah Subuh esok.
    next = fard[0];
    targetSeconds = next.minutes * 60 + 24 * 3600;
  }

  return {
    now,
    nextPrayerLabel: next.label,
    nextPrayerTime24: next.time24,
    remainingSeconds: targetSeconds - nowSeconds,
  };
}
