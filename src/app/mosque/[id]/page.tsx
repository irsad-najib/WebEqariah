"use client";
import axiosInstance from "@/app/component/API";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Navbar from "../../component/navbar";
import Sidebar from "../../component/sidebar";
import ChatSidebar from "../../component/chatSidebar";

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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Intersection Observer hooks
  const [backButtonRef, backButtonInView] = useInView({ threshold: 0.5, triggerOnce: true });
  const [headerRef, headerInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [imageRef, imageInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [contentRef, contentInView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams.id;
        if (!id) {
          setError(true);
          return;
        }
        const mosqueData = await getMosqueById(id);
        if (!mosqueData) {
          setError(true);
          return;
        }
        setMosque(mosqueData);
        try {
          const response = await axiosInstance.get(`/api/announcement/mosque/${id}`, { withCredentials: true });
          if (response.data && response.data.data) {
            setAnnouncements(response.data.data);
            console.log("Announcements fetched successfully:", response.data.data);
          }
        } catch (announcementError) {
          console.error("Error fetching announcements:", announcementError);
          setAnnouncements([]);
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
      <>
        <Navbar />
        <div className="bg-white min-h-screen mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600 text-lg">Loading mosque...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !mosque) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Masjid Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">Maaf, masjid yang Anda cari tidak dapat ditemukan.</p>
              <Link href="/mosque">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Kembali ke Daftar Masjid</button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex bg-gray-100 min-h-screen">
        <div className="sticky top-0 h-screen z-30"><Sidebar /></div>
        <div className="flex-1 px-4 py-8">
          <div className="max-w-5xl mx-auto bg-[#232526] rounded-lg shadow-md mb-8 relative overflow-hidden">
            <div className="h-24 md:h-32 w-full bg-white" />
            <div className="absolute left-8 top-8 flex items-end gap-4">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#232526] overflow-hidden bg-white flex items-center justify-center">
                  {mosque.imageUrl ? (
                    <Image src={mosque.imageUrl} alt={mosque.mosqueName} width={160} height={160} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
              </div>
              <div className="pb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{mosque.mosqueName}</h1>
              </div>
            </div>
            {/* Back Button */}
            <div className="absolute right-8 top-8">
              <Link href="/">
                <button className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white font-bold py-2 px-4 rounded transition-colors">Kembali</button>
              </Link>
            </div>
            <div className="h-32" /> {/* Spacer for image */}
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/*Pengumuman*/}
            <section className="md:col-span-2">
              <div>
                <h2 className="text-2xl font-bold mb-4">Announcement</h2>
                {announcements && announcements.length > 0 ? (
                  <div className="grid gap-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
                          <span className="text-sm text-gray-500">{formatDate(announcement.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                        {announcement.imageUrl && (
                          <div className="mt-3">
                            <Image src={announcement.imageUrl} alt={announcement.title} width={300} height={300} />
                          </div>
                        )}
                        {announcement.author && (
                          <p className="text-sm text-gray-500 mt-2">Oleh: {announcement.author.username}</p>
                        )}
                        {/* Like and Comment Section (no share) */}
                        <div className="flex border-t border-gray-300 mt-4 pt-2">
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-blue-600 font-semibold focus:outline-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-6 0v4M5 15h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
                            </svg>
                            Like
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-blue-600 font-semibold focus:outline-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m5-4h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2z" />
                            </svg>
                            Comment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada pengumuman saat ini.</p>
                )}
              </div>
            </section>
            {/* Following (Alamat & Kontak) */}
            <aside className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Details</h2>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Alamat</h3>
                  <p className="text-gray-700">{mosque.addressLine1}</p>
                  {mosque.addressLine2 && <p className="text-gray-700">{mosque.addressLine2}</p>}
                  <p className="text-gray-700">{mosque.city}, {mosque.state} {mosque.postalCode}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Kontak</h3>
                  <p className="text-gray-700"><strong>Penanggung Jawab:</strong> {mosque.contactPerson}</p>
                  <p className="text-gray-700"><strong>Telepon:</strong> {mosque.contactPhone}</p>
                </div>
                <div className="mt-6">
                  <p className="text-gray-500 text-sm mt-2">Terdaftar sejak: {formatDate(mosque.createdAt)}</p>
                </div>
              </div>
            </aside>
          </div>
          {/* Floating Back to Top Button */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-10 transition-opacity hover:opacity-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
        <div className="sticky top-0 h-screen z-30"><ChatSidebar /></div>
      </div>
    </>
  );
}
