"use client";
import axiosInstance from "@/app/component/API";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

// Format tanggal ke format Indonesia
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Mosque {
  id: string;
  mosqueName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
}
async function getMosqueById(id: string): Promise<Mosque | null> {
  if (!id) {
    console.error("Mosque ID is required");
    return null;
  }

  try {
    const response = await axiosInstance.get(`/api/mosque/${id}`, {
      withCredentials: true,
    });

    if (!response.data || !response.data.data) {
      console.error("Mosque not found");
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching mosque:", error);
    return null;
  }
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  author?: {
    username: string;
  };
}

interface MosquePageProps {
  params: { id: string };
}

export default function MosquePage({ params }: MosquePageProps) {
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]); // Tambahkan state untuk announcements
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Intersection Observer hooks
  const [backButtonRef, backButtonInView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const [headerRef, headerInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [imageRef, imageInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [contentRef, contentInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);

        // Handle params properly - params bisa berupa Promise di Next.js 13+
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams.id;

        if (!id) {
          setError(true);
          return;
        }

        // Fetch mosque data
        const mosqueData = await getMosqueById(id);
        if (!mosqueData) {
          setError(true);
          return;
        }
        setMosque(mosqueData);

        // Fetch announcements by mosque ID
        try {
          const response = await axiosInstance.get(
            `/api/announcement/mosque/${id}`,
            {
              withCredentials: true,
            }
          );

          if (response.data && response.data.data) {
            setAnnouncements(response.data.data);
            console.log(
              "Announcements fetched successfully:",
              response.data.data
            );
          }
        } catch (announcementError) {
          console.error("Error fetching announcements:", announcementError);
          // Tidak set error true karena mosque data sudah berhasil di-fetch
          setAnnouncements([]); // Set empty array jika gagal fetch announcements
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-amber-50 min-h-screen mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600 text-lg">Loading mosque...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mosque) {
    return (
      <div className="bg-amber-50 min-h-screen mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Masjid Tidak Ditemukan
            </h1>
            <p className="text-gray-600 mb-6">
              Maaf, masjid yang Anda cari tidak dapat ditemukan.
            </p>
            <Link href="/mosque">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Kembali ke Daftar Masjid
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 min-h-screen mx-auto px-4 py-8">
      {/* Back Button */}
      <div
        ref={backButtonRef}
        className={`mb-6 transition-opacity duration-1000 ${
          backButtonInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <Link href="/mosque">
          <div className="text-black hover:text-blue-800 inline-flex items-center group">
            <svg
              className="w-5 h-5 mr-2 group-hover:animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke daftar masjid
          </div>
        </Link>
      </div>

      {/* Mosque Container */}
      <article className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md text-black">
        {/* Header Section */}
        <header
          ref={headerRef}
          className={`mb-8 transition-opacity duration-1000 ${
            headerInView ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Mosque Name */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {mosque.mosqueName}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-600 mb-4 gap-3">
            <div className="flex items-center">
              <span className="font-medium">{mosque.contactPerson}</span>
              <span className="mx-2">•</span>
              <span>{mosque.contactPhone}</span>
            </div>

            <span
              className={`text-white text-sm px-3 py-1 rounded-full w-fit ${
                mosque.status === "APPROVED" ? "bg-green-500" : "bg-yellow-500"
              }`}
            >
              {mosque.status}
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {mosque.imageUrl && (
          <div
            ref={imageRef}
            className={`mb-8 overflow-hidden rounded-lg transition-opacity duration-1000 ${
              imageInView ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={mosque.imageUrl}
              alt={mosque.mosqueName}
              width={300}
              height={300}
              className="rounded "
            />
          </div>
        )}

        {/* Mosque Details */}
        <div
          ref={contentRef}
          className={`transition-opacity duration-1000 ${
            contentInView ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Alamat</h3>
              <p className="text-gray-700">{mosque.addressLine1}</p>
              {mosque.addressLine2 && (
                <p className="text-gray-700">{mosque.addressLine2}</p>
              )}
              <p className="text-gray-700">
                {mosque.city}, {mosque.state} {mosque.postalCode}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Kontak</h3>
              <p className="text-gray-700">
                <strong>Penanggung Jawab:</strong> {mosque.contactPerson}
              </p>
              <p className="text-gray-700">
                <strong>Telepon:</strong> {mosque.contactPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pengumuman</h2>
          {announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {announcement.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  {announcement.imageUrl && (
                    <div className="mt-3">
                      <Image
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        width={300}
                        height={300}
                      />
                    </div>
                  )}
                  {announcement.author && (
                    <p className="text-sm text-gray-500 mt-2">
                      Oleh: {announcement.author.username}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada pengumuman saat ini.</p>
          )}
        </div>

        {/* Mosque Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-gray-500 text-sm">
                Terdaftar sejak: {formatDate(mosque.createdAt)}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/mosque">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  Masjid Lainnya
                </button>
              </Link>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Ke Atas
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Floating Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-10 transition-opacity hover:opacity-90"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}
