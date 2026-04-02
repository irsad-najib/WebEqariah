"use client";
import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "@/lib/utils/api";
import { Speaker } from "@/lib/types";
import { fetchBidangIlmu } from "@/lib/api/bidangIlmu";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { parseEventDate } from "@/lib/utils/eventDate";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [categories, setCategories] = useState<string[]>(["Semua"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch speakers
        const speakersResponse = await axiosInstance.get(
          "/api/speaker/approved",
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

        // Fetch announcements + bidang ilmu (same endpoint used in Navbar)
        const [announcementsResult, bidangIlmuResult] =
          await Promise.allSettled([
            axiosInstance.get("/api/announcement"),
            fetchBidangIlmu(),
          ]);

        let announcementsList: Announcement[] = [];
        if (announcementsResult.status === "fulfilled") {
          const announcementsResponse = announcementsResult.value;
          announcementsList = Array.isArray(announcementsResponse?.data)
            ? announcementsResponse.data
            : [];
        } else {
          console.warn(
            "Error fetching announcements:",
            announcementsResult.reason,
          );
        }

        const bidangIlmu =
          bidangIlmuResult.status === "fulfilled" ? bidangIlmuResult.value : [];
        const bidangNames = bidangIlmu.map((b) => b.name).filter(Boolean);
        const nextCategories = ["Semua", ...Array.from(new Set(bidangNames))];
        setCategories(nextCategories);
        setSelectedCategory((prev) =>
          nextCategories.includes(prev) ? prev : "Semua",
        );

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

  const announcementsIndex = useMemo(() => {
    const bySpeakerId = new Map<number, Announcement[]>();
    const bySpeakerName = new Map<string, Announcement[]>();

    for (const ann of announcements) {
      if (!(ann.type === "kajian" || !ann.type)) continue;

      if (ann.speaker_id != null) {
        const arr = bySpeakerId.get(ann.speaker_id) ?? [];
        arr.push(ann);
        bySpeakerId.set(ann.speaker_id, arr);
        continue;
      }

      if (ann.speaker_name) {
        const key = ann.speaker_name.toLowerCase();
        const arr = bySpeakerName.get(key) ?? [];
        arr.push(ann);
        bySpeakerName.set(key, arr);
      }
    }

    const sortList = (a: Announcement, b: Announcement) => {
      const ta = a.event_date ? new Date(a.event_date).getTime() : NaN;
      const tb = b.event_date ? new Date(b.event_date).getTime() : NaN;
      if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb;
      if (Number.isFinite(ta)) return -1;
      if (Number.isFinite(tb)) return 1;
      return 0;
    };

    for (const [k, list] of bySpeakerId)
      bySpeakerId.set(k, list.sort(sortList));
    for (const [k, list] of bySpeakerName)
      bySpeakerName.set(k, list.sort(sortList));

    return { bySpeakerId, bySpeakerName };
  }, [announcements]);

  const getSpeakerAnnouncements = (speaker: Speaker) => {
    if (speaker.id != null) {
      const hit = announcementsIndex.bySpeakerId.get(speaker.id);
      if (hit) return hit;
    }
    const nameKey = (speaker.name || "").toLowerCase();
    return announcementsIndex.bySpeakerName.get(nameKey) ?? [];
  };

  const getSpeakerTags = (speaker: Speaker) => {
    const expertise = (speaker.expertise || "").trim();
    if (!expertise) return [] as string[];

    return expertise
      .split(/[,/|]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3);
  };

  const matchesCategory = (speaker: Speaker) => {
    if (selectedCategory === "Semua") return true;
    const hay = `${speaker.expertise || ""}`.toLowerCase();
    return hay.includes(selectedCategory.toLowerCase());
  };

  const getNearestAnnouncement = (speaker: Speaker) => {
    const list = getSpeakerAnnouncements(speaker);
    if (list.length === 0) return null;

    const now = Date.now();
    let best: Announcement | null = null;
    let bestDelta = Number.POSITIVE_INFINITY;

    for (const ann of list) {
      if (!ann.event_date) continue;
      const t = new Date(ann.event_date).getTime();
      if (!Number.isFinite(t)) continue;
      const delta = t - now;
      if (delta < -6 * 60 * 60 * 1000) continue;
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        best = ann;
      }
    }

    return best ?? list[0];
  };

  // Filter speakers based on search term
  const filteredSpeakers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return speakers.filter((speaker) => {
      if (!matchesCategory(speaker)) return false;
      if (!searchLower) return true;
      return (
        speaker.name.toLowerCase().includes(searchLower) ||
        speaker.expertise?.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, speakers, selectedCategory, announcements]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto w-full px-6 lg:px-48 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Daftar Ustaz & Jadual Kuliah
                </h1>
                <p className="text-sm text-gray-600 max-w-xl">
                  Cari pendidik kegemaran anda dan ikuti jadual pengajian di
                  masjid berdekatan.
                </p>
              </div>

              <div className="w-full md:w-[360px]">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Cari ustaz atau bidang ilmu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-200/70 text-gray-900 placeholder:text-gray-500 rounded-2xl pl-11 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 pr-2 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:theme(colors.emerald.200)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-emerald-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-300">
              {categories.map((c) => {
                const active = selectedCategory === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCategory(c)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                      active
                        ? "bg-[#4caf4f] border-[#4caf4f] text-white"
                        : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              {filteredSpeakers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <UserIcon className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-3 text-sm font-medium text-gray-900">
                    {searchTerm || selectedCategory !== "Semua"
                      ? "Tidak ada hasil"
                      : "Belum ada data ustaz."}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedCategory !== "Semua"
                      ? "Coba gunakan kata kunci atau kategori lain."
                      : "Silakan cek kembali nanti."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSpeakers.map((speaker) => {
                    const tags = getSpeakerTags(speaker);
                    const speakerSchedules = getSpeakerAnnouncements(speaker);

                    return (
                      <Link
                        key={speaker.id}
                        href={`/calendar?speaker_id=${speaker.id}`}
                        className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              {speaker.photo_url ? (
                                <Image
                                  src={speaker.photo_url}
                                  alt={speaker.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[#4caf4f] bg-emerald-50">
                                  <UserIcon size={22} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h2 className="text-sm font-bold text-gray-900 truncate uppercase">
                                {speaker.name}
                              </h2>

                              {tags.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {tags.slice(0, 2).map((t) => (
                                    <span
                                      key={t}
                                      className="text-[10px] font-bold tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    >
                                      {t.toUpperCase()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-gray-500 truncate">
                                  {speaker.expertise || "-"}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-gray-500 tracking-wider">
                                JADUAL KULIAH
                              </p>
                            </div>

                            {speakerSchedules.length > 0 ? (
                              <div className="mt-3 h-44 overflow-y-auto pr-2 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.300)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                                <div className="space-y-3">
                                  {speakerSchedules.map((ann) => {
                                    const { date, time } = parseEventDate(
                                      ann.event_date,
                                    );
                                    const mosqueName =
                                      ann.mosque?.mosqueName ||
                                      ann.mosqueInfo?.name;

                                    return (
                                      <div
                                        key={ann.id}
                                        className="rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                                      >
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                          {ann.title}
                                        </p>

                                        <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                                          {date && (
                                            <div className="flex items-center gap-2">
                                              <Calendar
                                                size={14}
                                                className="text-gray-500"
                                              />
                                              <span>{date}</span>
                                            </div>
                                          )}
                                          {time && (
                                            <div className="flex items-center gap-2">
                                              <Clock
                                                size={14}
                                                className="text-gray-500"
                                              />
                                              <span>{time}</span>
                                            </div>
                                          )}
                                          {mosqueName && (
                                            <div className="flex items-center gap-2">
                                              <MapPin
                                                size={14}
                                                className="text-emerald-600"
                                              />
                                              <span className="text-emerald-700 font-semibold line-clamp-1">
                                                {mosqueName}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 py-10 text-center text-gray-400">
                                <Calendar className="mx-auto h-7 w-7 mb-2" />
                                <p className="text-xs italic">
                                  Belum ada jadual kuliah
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
