"use client";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils/api";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";

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
    const fetchKajian = async () => {
      try {
        const response = await axiosInstance.get("/api/announcement");
        // Filter kajian type and upcoming/recent events
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        const filteredKajian = response.data
          .filter((item: AnnouncementResponse) => {
            // Check if it's a kajian
            if (item.type !== "kajian") return false;

            // Check date validity
            if (!item.event_date) return false;

            const eventDate = new Date(item.event_date);
            // Show if upcoming OR passed less than 6 hours ago
            return eventDate > sixHoursAgo;
          })
          .sort((a: AnnouncementResponse, b: AnnouncementResponse) => {
            // Sort by date ascending (nearest first)
            if (!a.event_date || !b.event_date) return 0;
            return (
              new Date(a.event_date).getTime() -
              new Date(b.event_date).getTime()
            );
          });

        setKajianList(filteredKajian);
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-24">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2 text-center">
          <Calendar className="w-5 h-5" />
          Jadwal Kajian Terdekat
        </h3>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {kajianList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada kajian terdekat</p>
          </div>
        ) : (
          kajianList.map((kajian) => {
            const eventDate = new Date(kajian.event_date!);
            const isPast = eventDate < new Date();

            return (
              <div
                key={kajian.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  isPast ? "opacity-75 bg-gray-50" : ""
                }`}
                onClick={() => router.push(`/mosque/${kajian.mosqueId}`)}>
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isPast
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-100 text-green-700"
                    }`}>
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
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4 text-green-600" />
                    <span>{kajian.speaker_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {eventDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>

                {kajian.mosqueInfo && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
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
    </div>
  );
};
