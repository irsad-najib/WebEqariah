"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { axiosInstance } from "@/lib/utils/api";
import Image from "next/image";
import { Speaker } from "@/lib/types";
import { MapPin, User as UserIcon } from "lucide-react";

export default function UstadzPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await axiosInstance.get("/api/speaker/approved");
        setSpeakers(response.data);
      } catch (err) {
        console.error("Error fetching speakers:", err);
        setError("Failed to load speakers");
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Daftar Ustadz & Jadwal Kajian
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
              <div
                key={speaker.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
                    {speaker.announcements &&
                    speaker.announcements.length > 0 ? (
                      <div className="space-y-3">
                        {speaker.announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p className="font-medium text-gray-800 mb-1">
                              {announcement.title}
                            </p>
                            {announcement.mosque && (
                              <div className="flex items-center text-gray-600 mt-1">
                                <MapPin size={14} className="mr-1" />
                                <span>{announcement.mosque.mosqueName}</span>
                              </div>
                            )}
                            {/* Assuming announcement might have a date field, if not we skip it for now or use created_at */}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Belum ada jadwal kajian.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
