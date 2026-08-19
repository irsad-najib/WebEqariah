"use client";
import { useRouter } from "next/navigation";
import { Mosque } from "@/components/features/mosque/Mosque";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { KajianSidebar } from "@/components/features/kajian/KajianSidebar";
// import { UnderConstruction } from "@/components/features/under-construction/underconstruction";

export default function Home() {
  const router = useRouter();

  const handleMosqueClick = (id: number) => {
    router.push(`/mosque/${id}`);
  };

  return (
    <>
      <Navbar />
      {/* <UnderConstruction /> */}
      {/* Uncomment the following lines to use the Mosque component */}

      <main>
        {/* Hero Section (full viewport minus navbar) */}
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-r from-green-600 to-emerald-700 text-white flex items-center">
          <div className="max-w-screen-2xl mx-auto w-full px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Selamat Datang ke Eqariah
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100 drop-shadow-lg">
                Platform Modern untuk Menghubungkan Masjid dan Jemaah
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push("/masjid")}
                  className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  MULAKAN CARIAN MASJID/SURAU ANDA DI SINI
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
