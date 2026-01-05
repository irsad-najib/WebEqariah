"use client";
import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/utils/api";
import { Speaker } from "@/lib/types";
import {
  MapPin,
  User as UserIcon,
  Calendar,
  Clock,
  Search,
} from "lucide-react";
import { DirectoryGridPage } from "@/components/features/directory/DirectoryGridPage";
import { DirectoryCardLink } from "@/components/features/directory/DirectoryCardLink";
import { parseEventDate } from "@/lib/utils/eventDate";

interface Announcement {
  id: number;
  title: string;
  content?: string;
  speaker_name?: string;
  speaker_id?: number;
  event_date?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  type?: string;
  mosqueId?: number;
  mosque?: {
    mosqueName: string;
  };
  mosqueInfo?: {
    name: string;
    image: string;
  };
}

export default function UstadzPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch speakers
        const speakersResponse = await axiosInstance.get(
          "/api/speaker/approved"
        );
        const speakersPayload = speakersResponse?.data;
        const speakersList = Array.isArray(speakersPayload)
          ? speakersPayload
          : Array.isArray(speakersPayload?.data)
          ? speakersPayload.data
          : [];

        if (!Array.isArray(speakersList)) {
          throw new Error("Invalid speaker payload");
        }

        // Fetch announcements
        let announcementsList: Announcement[] = [];
        try {
          const announcementsResponse = await axiosInstance.get(
            "/api/announcement"
          );
          announcementsList = Array.isArray(announcementsResponse?.data)
            ? announcementsResponse.data
            : [];
        } catch (err) {
          console.warn("Error fetching announcements:", err);
          announcementsList = [];
        }

        setSpeakers(speakersList);
        setAnnouncements(announcementsList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setSpeakers([]);
        setAnnouncements([]);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSpeakerAnnouncements = (speaker: Speaker) => {
    const name = (speaker.name || "").toLowerCase();
    return announcements.filter((ann) => {
      if (!(ann.type === "kajian" || !ann.type)) return false;
      if (ann.speaker_id != null) return ann.speaker_id === speaker.id;
      if (ann.speaker_name) return ann.speaker_name.toLowerCase() === name;
      return false;
    });
  };

  // Filter speakers based on search term
  const filteredSpeakers = useMemo(() => {
    if (searchTerm.trim() === "") {
      return speakers;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return speakers.filter(
      (speaker) =>
        speaker.name.toLowerCase().includes(searchLower) ||
        speaker.expertise?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, speakers]);

  return (
    <DirectoryGridPage
      title="Daftar Ustadz & Jadwal Kuliah"
      loading={loading}
      error={error}
      emptyTitle="Belum ada data ustadz."
      emptySubtitle="Silakan cek kembali nanti.">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari ustadz berdasarkan nama atau bidang keahlian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none text-black"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Search size={16} />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Menampilkan {filteredSpeakers.length} dari {speakers.length} ustadz
          </p>
        )}
      </div>

      {filteredSpeakers.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? "Tidak ada hasil" : "Belum ada data ustadz."}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Coba gunakan kata kunci lain."
              : "Silakan cek kembali nanti."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map((speaker) => (
            <DirectoryCardLink
              key={speaker.id}
              href={`/calendar?speaker_id=${speaker.id}`}
              title={speaker.name}
              subtitle={speaker.expertise}
              imageUrl={speaker.photo_url}
              fallback={<UserIcon size={32} />}>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Jadwal Kajian:
                </h3>
                {(() => {
                  const speakerAnnouncements = getSpeakerAnnouncements(speaker);
                  return speakerAnnouncements.length > 0 ? (
                    <div className="space-y-3">
                      {speakerAnnouncements.map((announcement) => {
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
                            {(announcement.mosque ||
                              announcement.mosqueInfo) && (
                              <div className="flex items-center text-gray-600 text-xs mt-1">
                                <MapPin size={12} className="mr-1" />
                                <span>
                                  {announcement.mosque?.mosqueName ||
                                    announcement.mosqueInfo?.name}
                                </span>
                              </div>
                            )}
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
