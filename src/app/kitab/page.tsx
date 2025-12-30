"use client";

import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils/api";
import type { Announcement, Kitab } from "@/lib/types";
import { DirectoryGridPage } from "@/components/features/directory/DirectoryGridPage";
import { DirectoryCardLink } from "@/components/features/directory/DirectoryCardLink";
import { BookOpen, Calendar, Clock, MapPin } from "lucide-react";
import { parseEventDate } from "@/lib/utils/eventDate";

export default function KitabPage() {
  const [kitabs, setKitabs] = useState<Kitab[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kitabsResponse = await axiosInstance.get("/api/kitab/approved", {
          withCredentials: true,
        });
        const kitabsPayload = kitabsResponse?.data;
        const kitabsList = Array.isArray(kitabsPayload)
          ? kitabsPayload
          : Array.isArray(kitabsPayload?.data)
          ? kitabsPayload.data
          : [];

        let announcementsList: Announcement[] = [];
        try {
          const announcementsResponse = await axiosInstance.get(
            "/api/announcement"
          );
          const announcementsPayload = announcementsResponse?.data;
          announcementsList = Array.isArray(announcementsPayload)
            ? announcementsPayload
            : Array.isArray(announcementsPayload?.data)
            ? announcementsPayload.data
            : [];
        } catch (err) {
          console.warn("Error fetching announcements:", err);
          announcementsList = [];
        }

        setKitabs(kitabsList);
        setAnnouncements(announcementsList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setKitabs([]);
        setAnnouncements([]);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getKitabAnnouncements = (kitab: Kitab) => {
    return announcements.filter((ann) => {
      if (!(ann.type === "kajian" || !ann.type)) return false;
      if (ann.kitab_id == null) return false;
      return ann.kitab_id === kitab.id;
    });
  };

  return (
    <DirectoryGridPage
      title="Daftar Kitab & Jadwal Kuliah"
      loading={loading}
      error={error}
      emptyTitle="Belum ada data kitab."
      emptySubtitle="Silakan cek kembali nanti.">
      {kitabs.length === 0 ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitabs.map((kitab) => (
            <DirectoryCardLink
              key={kitab.id}
              href={`/calendar?kitab_id=${kitab.id}`}
              title={kitab.judul}
              subtitle={[kitab.pengarang, kitab.bidang_ilmu]
                .filter(Boolean)
                .join(" • ")}
              imageUrl={null}
              fallback={<BookOpen size={32} />}>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Jadwal Kajian:
                </h3>
                {(() => {
                  const kitabAnnouncements = getKitabAnnouncements(kitab);
                  return kitabAnnouncements.length > 0 ? (
                    <div className="space-y-3">
                      {kitabAnnouncements.map((announcement) => {
                        const { date, time } = parseEventDate(
                          announcement.event_date
                        );
                        return (
                          <div
                            key={announcement.id}
                            className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p className="font-medium text-gray-800 mb-2">
                              {announcement.title}
                            </p>
                            {date && (
                              <div className="flex items-center text-gray-600 text-xs mb-1">
                                <Calendar size={12} className="mr-1" />
                                <span>{date}</span>
                              </div>
                            )}
                            {time && (
                              <div className="flex items-center text-gray-600 text-xs mb-1">
                                <Clock size={12} className="mr-1" />
                                <span>{time}</span>
                              </div>
                            )}
                            {(announcement as any).mosque ||
                            announcement.mosqueInfo ? (
                              <div className="flex items-center text-gray-600 text-xs mt-1">
                                <MapPin size={12} className="mr-1" />
                                <span>
                                  {(announcement as any).mosque?.mosqueName ||
                                    announcement.mosqueInfo?.name}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Belum ada jadwal kajian.
                    </p>
                  );
                })()}
              </div>
            </DirectoryCardLink>
          ))}
        </div>
      )}
    </DirectoryGridPage>
  );
}
