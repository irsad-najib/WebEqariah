"use client";

import { MapPin, RefreshCw } from "lucide-react";
import type { LocationSource } from "@/lib/utils/geolocation";

interface Props {
  source: LocationSource | null;
  locationLabel: string | null;
  permissionDenied: boolean;
  gpsError: string | null;
  loading: boolean;
  onRetry: () => void;
}

/** Notis kecil di bawah papan: dari mana lokasi datang dan cara membetulkannya. */
export function LocationNotice({
  source,
  locationLabel,
  permissionDenied,
  gpsError,
  loading,
  onRetry,
}: Props) {
  // Koordinat sebenar peranti — tiada apa perlu diberitahu.
  if (source === "gps" || source === "cache") return null;

  const place = locationLabel ?? "lokasi anggaran";
  const reason = permissionDenied
    ? "Akses lokasi ditolak"
    : (gpsError ?? "Lokasi tidak dikesan");

  const detail =
    source === "ip"
      ? `menganggar dari alamat IP (${place})`
      : `memaparkan waktu solat bagi ${place}`;

  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-green-50/90">
      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
      <span>
        {reason} — {detail}.
      </span>

      <button
        onClick={onRetry}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded border border-amber-300/60 px-2 py-0.5 font-semibold text-amber-200 transition-colors hover:bg-amber-300 hover:text-emerald-900 disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        Guna lokasi saya
      </button>

      {permissionDenied && (
        <span className="w-full text-center text-green-50/70">
          Kebenaran disekat — benarkan lokasi melalui ikon kunci di bar alamat
          pelayar, kemudian tekan butang di atas.
        </span>
      )}
    </div>
  );
}
