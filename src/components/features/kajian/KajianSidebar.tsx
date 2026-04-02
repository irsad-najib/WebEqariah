"use client";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils/api";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateIndonesian } from "@/lib/utils/dayNames";

const KAJIAN_SIDEBAR_CACHE_KEY = "eqariah_kajian_sidebar_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface Kajian {
  id: number;
  title: string;
  content: string;
  speaker_name?: string;
  event_date?: string;
  mosqueInfo?: {
    name: string;
    image: string;
  };
  mosqueId: number;
}

interface AnnouncementResponse {
  id: number;
  title: string;
  content: string;
  type?: string;
  event_date?: string;
  speaker_name?: string;
  mosqueId: number;
  mosqueInfo?: {
    name: string;
    image: string;
  };
}

export const KajianSidebar = () => {
  const [kajianList, setKajianList] = useState<Kajian[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hydrate from cache first to reduce perceived loading.
    try {
      const raw = sessionStorage.getItem(KAJIAN_SIDEBAR_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts?: number; data?: Kajian[] };
        if (
          parsed?.ts &&
          Array.isArray(parsed?.data) &&
          Date.now() - parsed.ts < CACHE_TTL_MS
        ) {
          setKajianList(parsed.data);
          setLoading(false);
        }
      }
    } catch {
      // ignore cache failures
    }

    const fetchKajian = async () => {
      try {
        const response = await axiosInstance.get("/api/announcement");
        const payload = response?.data;
        const list: AnnouncementResponse[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        // Filter kajian type and upcoming/recent events
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        // Pick 3 nearest kajian events without sorting the whole list.
        const top: Array<{ t: number; item: Kajian }> = [];

        for (const item of list) {
          if (item.type !== "kajian") continue;
          if (!item.event_date) continue;

          const t = new Date(item.event_date).getTime();
          if (!Number.isFinite(t)) continue;
          if (t <= sixHoursAgo.getTime()) continue;

          const kajian: Kajian = {
            id: item.id,
            title: item.title,
            content: item.content,
            speaker_name: item.speaker_name,
            event_date: item.event_date,
            mosqueId: item.mosqueId,
            mosqueInfo: item.mosqueInfo,
          };

          // insert into sorted top array (ascending by t)
          let inserted = false;
          for (let i = 0; i < top.length; i++) {
            if (t < top[i].t) {
              top.splice(i, 0, { t, item: kajian });
              inserted = true;
              break;
            }
          }
          if (!inserted) top.push({ t, item: kajian });
          if (top.length > 3) top.length = 3;
        }

        const filteredKajian = top.map((x) => x.item);
        setKajianList(filteredKajian);

        try {
          sessionStorage.setItem(
            KAJIAN_SIDEBAR_CACHE_KEY,
            JSON.stringify({ ts: Date.now(), data: filteredKajian }),
          );
        } catch {
          // ignore cache write failures
        }
      } catch (error) {
        console.error("Error fetching kajian:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKajian();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2 text-center">
          <Calendar className="w-5 h-5" />
          Jadual Kuliah Terdekat
        </h3>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {kajianList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada kuliah terdekat</p>
          </div>
        ) : (
          kajianList.slice(0, 3).map((kajian) => {
            const eventDate = new Date(kajian.event_date!);
            const isPast = eventDate < new Date();

            return (
              <div
                key={kajian.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  isPast ? "opacity-75 bg-gray-50" : ""
                }`}
                onClick={() => router.push(`/mosque/${kajian.mosqueId}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isPast
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isPast ? "Sedang/Baru Selesai" : "Akan Datang"}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {eventDate.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">
                  {kajian.title}
                </h4>

                {kajian.speaker_name && (
                  <div className="flex items-center gap-2 text-base text-gray-600 mb-1">
                    <User className="w-4 h-4 text-green-600" />
                    <span>{kajian.speaker_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateIndonesian(eventDate)}</span>
                </div>

                {/* <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {eventDate.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div> */}

                {kajian.mosqueInfo && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">
                      {kajian.mosqueInfo.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => router.push("/calendar")}
          className="w-full px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors font-semibold text-sm"
        >
          Lihat Kalender Penuh
        </button>
      </div>
    </div>
  );
};
