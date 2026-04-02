"use client";
import { axiosInstance } from "@/lib/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";

type Mosque = {
  id: number;
  mosqueName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  imageUrl: string;
};

type MosqueProps = {
  onClick: (id: number) => void;
};
export const Mosque: React.FC<MosqueProps> = ({ onClick }) => {
  const [mosqueData, setMosqueData] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMosque = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/mosque/");

        if (response.data.success && response.data.data) {
          setMosqueData(response.data.data);
        } else if (Array.isArray(response.data)) {
          setMosqueData(response.data);
        } else {
          setError("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching mosque data:", error);
        setError("Failed to fetch mosque data");
      } finally {
        setLoading(false);
      }
    };

    fetchMosque();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-700">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-red-500">
        {error}
      </div>
    );
  }
  if (!Array.isArray(mosqueData) || mosqueData.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        No mosque data found.
      </div>
    );
  }

  const filteredMosques = mosqueData.filter((mosque) => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    const mosqueName = (mosque.mosqueName || "").toLowerCase();
    const city = (mosque.city || "").toLowerCase();
    const address = (mosque.addressLine2 || "").toLowerCase();
    const state = (mosque.state || "").toLowerCase();

    return searchTerms.every(
      (term) =>
        mosqueName.includes(term) ||
        city.includes(term) ||
        address.includes(term) ||
        state.includes(term),
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMosques.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentMosques = filteredMosques.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="w-full text-gray-900">
      <div className="w-full max-w-xl mx-auto mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">
          Cari Masjid Berhampiran Anda
        </h2>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Cari nama masjid atau lokasi "
            className="w-full bg-gray-200/70 text-gray-900 placeholder:text-gray-500 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredMosques.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMosques.map((mosque) => {
              const location = [mosque.addressLine2, mosque.city, mosque.state]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={mosque.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onClick(mosque.id)}
                >
                  <div className="relative w-full h-60 bg-gray-100">
                    {mosque.imageUrl ? (
                      <Image
                        src={mosque.imageUrl}
                        alt={mosque.mosqueName}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                      {mosque.mosqueName}
                    </h3>

                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="mt-0.5 text-emerald-600">
                        <MapPin size={16} />
                      </span>
                      <p className="[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                        {location || mosque.addressLine1 || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-sm text-gray-600">
                Page{" "}
                <span className="font-medium text-gray-800">
                  {safeCurrentPage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-800">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500 mt-4 text-center">
          Tidak ada masjid yang ditemukan.
        </div>
      )}
    </div>
  );
};
