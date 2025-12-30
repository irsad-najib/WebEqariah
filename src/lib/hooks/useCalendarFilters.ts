"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type CalendarFilterState = {
  q: string;
  bidangIlmu: string[];
  speakerIds: number[];
  kitabIds: number[];
  ym: string; // YYYY-MM
};

const toInt = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const uniq = <T>(values: T[]) => Array.from(new Set(values));

const pad2 = (n: number) => String(n).padStart(2, "0");

export const formatYm = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

const clampToFirstOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export function useCalendarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const readStringArray = (key: string): string[] => {
    const all = searchParams
      .getAll(key)
      .map((v) => v.trim())
      .filter(Boolean);
    return uniq(all);
  };

  const readIntArray = (key: string): number[] => {
    const all = searchParams
      .getAll(key)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => toInt(v))
      .filter((v): v is number => v != null);
    return uniq(all);
  };

  const state: CalendarFilterState = useMemo(() => {
    const now = new Date();
    const ymFromUrl = searchParams.get("ym");
    const ym =
      ymFromUrl && /^\d{4}-\d{2}$/.test(ymFromUrl) ? ymFromUrl : formatYm(now);

    return {
      q: searchParams.get("q") ?? "",
      bidangIlmu: readStringArray("bidang_ilmu"),
      speakerIds: readIntArray("speaker_id"),
      kitabIds: readIntArray("kitab_id"),
      ym,
    };
  }, [searchParams]);

  const monthDate = useMemo(() => {
    const [y, m] = state.ym.split("-").map((v) => Number.parseInt(v, 10));
    if (!y || !m) return clampToFirstOfMonth(new Date());
    return new Date(y, m - 1, 1);
  }, [state.ym]);

  const setParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);

    // remove empty keys
    for (const [k, v] of Array.from(params.entries())) {
      if (!v) params.delete(k);
    }

    const qs = params.toString();
    router.push(qs ? `/calendar?${qs}` : "/calendar");
  };

  const setQ = (q: string) =>
    setParams((p) => {
      p.set("q", q);
    });

  const setBidangIlmu = (values: string[]) =>
    setParams((p) => {
      p.delete("bidang_ilmu");
      for (const v of uniq(values.map((x) => x.trim()).filter(Boolean))) {
        p.append("bidang_ilmu", v);
      }
    });

  const toggleBidangIlmu = (value: string) => {
    const next = new Set(state.bidangIlmu);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setBidangIlmu(Array.from(next));
  };

  const setSpeakerIds = (values: number[]) =>
    setParams((p) => {
      p.delete("speaker_id");
      for (const v of uniq(values).filter((x) => Number.isFinite(x))) {
        p.append("speaker_id", String(v));
      }
    });

  const toggleSpeakerId = (value: number) => {
    const next = new Set(state.speakerIds);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSpeakerIds(Array.from(next));
  };

  const setKitabIds = (values: number[]) =>
    setParams((p) => {
      p.delete("kitab_id");
      for (const v of uniq(values).filter((x) => Number.isFinite(x))) {
        p.append("kitab_id", String(v));
      }
    });

  const toggleKitabId = (value: number) => {
    const next = new Set(state.kitabIds);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setKitabIds(Array.from(next));
  };

  const setMonth = (date: Date) =>
    setParams((p) => {
      p.set("ym", formatYm(date));
    });

  const shiftMonth = (delta: number) => {
    const base = monthDate;
    const next = new Date(base.getFullYear(), base.getMonth() + delta, 1);
    setMonth(next);
  };

  return {
    state,
    monthDate,
    setQ,
    setBidangIlmu,
    toggleBidangIlmu,
    setSpeakerIds,
    toggleSpeakerId,
    setKitabIds,
    toggleKitabId,
    setMonth,
    shiftMonth,
  };
}
