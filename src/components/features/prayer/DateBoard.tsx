"use client";

import { CalendarDays, Moon } from "lucide-react";
import type { PrayerTimesData } from "@/lib/api/prayerTimes";
import type { PrayerClock } from "@/lib/hooks/usePrayerClock";
import {
  MALAY_MONTHS_SHORT,
  MALAY_WEEKDAYS,
  hijriMonthToMalay,
} from "@/lib/utils/islamicDate";
import { Panel } from "./Panel";

interface Props {
  data: PrayerTimesData;
  clock: PrayerClock;
}

export function DateBoard({ data, clock }: Props) {
  const { now } = clock;
  const weekday = MALAY_WEEKDAYS[now.weekday];
  const gregorian = `${now.day} ${MALAY_MONTHS_SHORT[now.month - 1]} ${now.year}`;
  const hijri = `${data.hijri.day} ${hijriMonthToMalay(data.hijri.monthNumber)} ${
    data.hijri.year
  }H`;

  return (
    <Panel>
      <div className="flex items-center gap-3">
        <Entry
          icon={<CalendarDays className="h-5 w-5 text-amber-300" strokeWidth={2} />}
          caption="TARIKH MASIHI"
          value={gregorian}
          sub={weekday}
        />
        <span className="h-9 w-px bg-amber-200/30" />
        <Entry
          icon={<Moon className="h-5 w-5 text-amber-300" strokeWidth={2} />}
          caption="TARIKH HIJRAH"
          value={hijri}
          sub={weekday}
        />
      </div>
    </Panel>
  );
}

function Entry({
  icon,
  caption,
  value,
  sub,
}: {
  icon: React.ReactNode;
  caption: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="rounded-sm bg-emerald-950/60 p-1.5 ring-1 ring-amber-300/40">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-[8px] font-semibold tracking-wider text-amber-100/70">
          {caption}
        </div>
        <div className="whitespace-nowrap text-[13px] font-bold text-amber-300">
          {value}
        </div>
        <div className="text-[8px] font-semibold tracking-wider text-amber-100/60">
          {sub}
        </div>
      </div>
    </div>
  );
}
