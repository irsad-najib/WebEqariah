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

      <main className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Selamat Datang di Eqariah
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100">
                Platform Modern untuk Menghubungkan Masjid dan Jemaah
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/overview")}
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lihat Overview
                </button>
                <button
                  onClick={() => router.push("/instructions")}
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-green-600 transition-all duration-300 flex items-center justify-center gap-2">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Cara Menggunakan
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
