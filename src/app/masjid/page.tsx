"use client";
import { useRouter } from "next/navigation";
import { Mosque } from "@/components/features/mosque/Mosque";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { KajianSidebar } from "@/components/features/kajian/KajianSidebar";

export default function Masjid() {
  const router = useRouter();

  const handleMosqueClick = (id: number) => {
    router.push(`/mosque/${id}`);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Kajian Section (Visible only on mobile) */}
            <div className="lg:hidden mb-8">
              <KajianSidebar />
            </div>

            {/* Mosque List (Main Content) */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
                Temukan Masjid di Sekitar Anda
              </h2>
              <Mosque onClick={handleMosqueClick} />
            </div>

            {/* Desktop Kajian Sidebar (Visible only on desktop) */}
            <div className="hidden lg:block w-80 flex-shrink-0 ml-auto">
              <KajianSidebar />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
