"use client";

import { useEffect, useState } from "react";
import type { Announcement, Kitab, Speaker } from "@/lib/types";
import { axiosInstance } from "@/lib/utils/api";

export function useCalendarData() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [kitabs, setKitabs] = useState<Kitab[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [speakerRes, kitabRes, announcementRes] = await Promise.all([
          axiosInstance.get("/api/speaker/approved"),
          axiosInstance.get("/api/kitab/approved", { withCredentials: true }),
          axiosInstance.get("/api/announcement"),
        ]);

        const speakerPayload = speakerRes?.data;
        const speakerList = Array.isArray(speakerPayload)
          ? speakerPayload
          : Array.isArray(speakerPayload?.data)
          ? speakerPayload.data
          : [];

        const kitabPayload = kitabRes?.data;
        const kitabList = Array.isArray(kitabPayload)
          ? kitabPayload
          : Array.isArray(kitabPayload?.data)
          ? kitabPayload.data
          : Array.isArray(kitabPayload?.data?.data)
          ? kitabPayload.data.data
          : [];

        const announcementPayload = announcementRes?.data;
        const announcementList = Array.isArray(announcementPayload)
          ? announcementPayload
          : Array.isArray(announcementPayload?.data)
          ? announcementPayload.data
          : [];

        setSpeakers(speakerList);
        setKitabs(kitabList);
        setAnnouncements(announcementList);
      } catch (err) {
        console.error("Failed to load calendar data:", err);
        setError("Gagal memuat data kalender.");
        setSpeakers([]);
        setKitabs([]);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { speakers, kitabs, announcements, loading, error };
}
