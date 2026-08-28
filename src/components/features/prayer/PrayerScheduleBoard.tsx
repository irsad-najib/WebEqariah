"use client";

import { CloudSun, Moon, MoonStar, Sun, Sunrise, Sunset } from "lucide-react";
import type { PrayerKey, PrayerTimesData } from "@/lib/api/prayerTimes";
import { to12Hour } from "@/lib/utils/islamicDate";
import { Panel } from "./Panel";

const PRAYER_ICONS: Record<PrayerKey, typeof Sun> = {
  Fajr: Moon,
  Sunrise: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: MoonStar,
};

interface Props {
  data: PrayerTimesData;
  /** Label solat yang sedang ditandakan (solat seterusnya) */
  highlightLabel?: string;
}

export function PrayerScheduleBoard({ data, highlightLabel }: Props) {
  return (
    <Panel>
      <div className="mb-1.5 flex items-center justify-center gap-2 rounded-sm bg-amber-300 px-2 py-0.5">
        <span className="text-[10px] text-emerald-900">✦</span>
        <span className="text-[11px] font-bold tracking-[0.15em] text-emerald-900">
          JADUAL WAKTU SOLAT
        </span>
        <span className="text-[10px] text-emerald-900">✦</span>
      </div>

      <div className="flex">
        {data.timings.map((t) => {
          const Icon = PRAYER_ICONS[t.key];
          const isNext = t.label === highlightLabel;
          const { time, period } = to12Hour(t.time24);

          return (
            <div
              key={t.key}
              className={`relative flex flex-1 flex-col items-center gap-1 px-2 py-1 ${
                isNext ? "rounded-sm bg-emerald-900/60 ring-1 ring-amber-300" : ""
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isNext ? "text-amber-300" : "text-amber-200/70"
                }`}
                strokeWidth={2}
              />
              <span className="text-[9px] font-semibold tracking-wider text-amber-100/80">
                {t.label}
              </span>
              <span
                className={`text-lg font-bold leading-none ${
                  isNext ? "text-amber-300" : "text-white"
                }`}
              >
                {time}
              </span>
              <span className="text-[9px] font-semibold text-amber-100/70">
                {period}
              </span>

              {isNext && (
                <span className="absolute -bottom-[9px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-amber-300" />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
