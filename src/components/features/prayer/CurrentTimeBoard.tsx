"use client";

import { Clock } from "lucide-react";
import type { PrayerClock } from "@/lib/hooks/usePrayerClock";
import { formatCountdown } from "@/lib/utils/islamicDate";
import { Panel } from "./Panel";

export function CurrentTimeBoard({ clock }: { clock: PrayerClock }) {
  const { now } = clock;
  const period = now.hours >= 12 ? "PM" : "AM";
  const hour12 = now.hours % 12 === 0 ? 12 : now.hours % 12;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Panel className="min-w-[240px]">
      <div className="text-center text-[10px] font-bold tracking-[0.2em] text-amber-100/80">
        WAKTU SEMASA
      </div>

      <div className="flex items-baseline justify-center gap-1 leading-none">
        <span
          className="text-4xl font-bold text-white tabular-nums"
          suppressHydrationWarning
        >
          {hour12}:{pad(now.minutes)}
        </span>
        <span className="text-xl font-bold text-amber-300 tabular-nums">
          :{pad(now.seconds)}
        </span>
        <span className="text-[10px] font-bold text-amber-100/80">{period}</span>
      </div>

      <div className="mt-1 flex items-end justify-between px-1 text-[8px] font-semibold tracking-wider text-amber-100/70">
        <span>SOLAT SETERUSNYA</span>
        <span>Baki Masa</span>
      </div>

      <div className="mt-0.5 flex items-center gap-1.5 rounded-sm bg-emerald-950/70 px-1.5 py-1 ring-1 ring-amber-300/50">
        <Clock className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={2} />
        <span className="flex-1 text-center text-sm font-bold tracking-wide text-amber-300">
          {clock.nextPrayerLabel}
        </span>
        <span className="text-sm font-bold text-white tabular-nums">
          {formatCountdown(clock.remainingSeconds)}
        </span>
      </div>
    </Panel>
  );
}
