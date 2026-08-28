"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPrayerTimes, type PrayerTimesData } from "@/lib/api/prayerTimes";
import {
  resolveLocation,
  watchPermission,
  type LocationSource,
} from "@/lib/utils/geolocation";

/** Waktu solat hanya berubah sekali sehari — muat semula sejam sekali memadai. */
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

export interface UsePrayerTimesResult {
  data: PrayerTimesData | null;
  loading: boolean;
  error: string | null;
  /** Dari mana koordinat diperoleh: gps | cache | ip | timezone */
  source: LocationSource | null;
  /** Nama lokasi anggaran; null bila koordinat sebenar peranti */
  locationLabel: string | null;
  /** true bila pengguna menolak kebenaran lokasi */
  permissionDenied: boolean;
  /** Sebab GPS gagal, untuk mesej bantuan */
  gpsError: string | null;
  /** Muat semula; `force` melangkau cache dan meminta GPS baharu */
  refresh: (force?: boolean) => void;
}

export function usePrayerTimes(): UsePrayerTimesResult {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<LocationSource | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [request, setRequest] = useState({ tick: 0, force: false });

  const refresh = useCallback((force = false) => {
    setRequest((r) => ({ tick: r.tick + 1, force }));
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const outcome = await resolveLocation({ forceFresh: request.force });
        if (!active) return;

        setSource(outcome.location.source);
        setLocationLabel(outcome.location.label);
        setPermissionDenied(outcome.denied);
        setGpsError(outcome.gpsError);

        const result = await fetchPrayerTimes(
          outcome.location.latitude,
          outcome.location.longitude,
          controller.signal
        );
        if (!active) return;
        setData(result);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Gagal memuat waktu solat"
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [request]);

  // Muat semula automatik bila pengguna menukar kebenaran lokasi di pelayar.
  useEffect(() => {
    return watchPermission((state) => {
      if (state === "granted") refresh(true);
    });
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => refresh(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  // Muat semula bila pengguna kembali ke tab selepas lama ditinggalkan.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  return {
    data,
    loading,
    error,
    source,
    locationLabel,
    permissionDenied,
    gpsError,
    refresh,
  };
}
