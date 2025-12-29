"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Speaker = {
  id: number;
  name: string;
  title?: string;
  photo?: string;
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
        const res = await axiosInstance.get(`/api/speakers/${id}`);
        // axiosInstance returns axios response; API uses { data }
        setSpeaker(res.data || res.data?.data || null);
      } catch (err: any) {
        console.error("Failed to fetch speaker", err);
        setError(err?.message || "Failed to load speaker");
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
            ← Back
          </button>

          {loading && <div>Loading speaker...</div>}

          {error && (
            <div className="text-red-600">Error loading speaker: {error}</div>
          )}

          {speaker && (
            <div className="bg-white p-8 rounded-lg shadow">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {speaker.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    className="w-36 h-36 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                    {speaker.name?.[0] || "S"}
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{speaker.name}</h1>
                  {speaker.title && (
                    <p className="text-green-600 mt-1">{speaker.title}</p>
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
            <div className="text-gray-600">No speaker found.</div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
