"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { axiosInstance } from "@/lib/utils/api";
import Image from "next/image";
import { Speaker } from "@/lib/types";
import { MapPin, User as UserIcon, Calendar, Clock } from "lucide-react";
import { KajianSidebar } from "@/components/features/kajian/KajianSidebar";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch speakers
        const speakersResponse = await axiosInstance.get("/api/speaker/approved");
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

  // Function to get announcements for a specific speaker by name
  const getSpeakerAnnouncements = (speakerName: string) => {
    return announcements.filter(
      (ann) =>
        (ann.speaker_name?.toLowerCase() === speakerName.toLowerCase() ||
          ann.speaker_id) &&
        (ann.type === "kajian" || !ann.type)
    );
  };

  // Helper function to parse event_date into formatted date and time
  const parseEventDate = (eventDate: string | undefined) => {
    if (!eventDate) return { date: "", time: "" };

    try {
      const date = new Date(eventDate);
      return {
        date: date.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        time: date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: eventDate, time: "" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Daftar Ustadz & Jadwal Kuliah
        </h1>
        

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : speakers.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm">
            <UserIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-medium">Belum ada data ustadz.</p>
            <p className="text-sm mt-2">Silakan cek kembali nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Link
                key={speaker.id}
                href={`/ustadz/${speaker.id}`}
                className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      {speaker.photo_url ? (
                        <Image
                          src={speaker.photo_url}
                          alt={speaker.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <UserIcon size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {speaker.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {speaker.expertise}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Jadwal Kajian:
                    </h3>
                    {(() => {
                      const speakerAnnouncements = getSpeakerAnnouncements(
                        speaker.name
                      );
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
