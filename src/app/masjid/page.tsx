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
        <div className="mx-auto w-full px-6 lg:px-32 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Kajian Section (Visible only on mobile) */}
            <div className="lg:hidden mb-8">
              <KajianSidebar />
            </div>

            {/* Mosque List (Main Content) */}

            <div className="flex gap-8 w-full">
              <Mosque onClick={handleMosqueClick} />
              <div className="hidden lg:block w-80 flex-shrink-0 pt-36">
                <KajianSidebar />
              </div>
            </div>

            {/* Desktop Kajian Sidebar (Visible only on desktop) */}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
