"use client";
import { useRouter } from "next/navigation";
import { Mosque } from "@/components/features/mosque/Mosque";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Temukan Masjid di Sekitar Anda
          </h1>
          <Mosque onClick={handleMosqueClick} />
        </div>
      </main>
      <Footer />
    </>
  );
}
