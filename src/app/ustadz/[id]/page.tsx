"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { axiosInstance } from "@/lib/utils/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Speaker = {
  id: number;
  name: string;
  expertise?: string;
  photo_url?: string;
  bio?: string;
  [key: string]: any;
};

export default function SpeakerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchSpeaker = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/speaker/${id}`);
        const payload = res?.data;
        const data = payload?.data ?? payload;
        if (!data) throw new Error("Not found");
        setSpeaker(data);
      } catch (err: any) {
        console.error("Failed to fetch speaker", err);
        // Map axios 404 message
        setError(err?.response?.status === 404 ? "Speaker not found" : err?.message || "Failed to load speaker");
      } finally {
        setLoading(false);
      }
    };

    fetchSpeaker();
  }, [id]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm text-green-600 hover:underline">
            ← Kembali
          </button>

          {loading && <div>Memuat Ustaz...</div>}

          {error && (
            <div className="text-red-600">Error memuat ustaz: {error}</div>
          )}

          {speaker && (
            <div className="bg-white p-8 rounded-lg shadow">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {speaker.photo_url ? (
                  <div className="relative w-36 h-36 flex-shrink-0">
                    <Image
                      src={speaker.photo_url}
                      alt={speaker.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {speaker.name?.[0] || "S"}
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{speaker.name}</h1>
                  {speaker.expertise && (
                    <p className="text-green-600 mt-1">{speaker.expertise}</p>
                  )}
                  {speaker.bio && (
                    <div className="mt-4 text-gray-700 whitespace-pre-line">
                      {speaker.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && !speaker && !error && (
            <div className="text-gray-600">Tiada ustaz ditemui.</div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
