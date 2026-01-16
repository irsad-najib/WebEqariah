"use client";
import { axiosInstance } from "@/lib/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";

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

  useEffect(() => {
    const fetchMosque = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/mosque/");
        console.log("Mosque response:", response.data);

        // Handle response format yang dibungkus dalam success object
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
      <div className="bg-gray-100 flex items-center justify-center min-h-screen text-black">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }
  if (!Array.isArray(mosqueData) || mosqueData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No mosque data found.
      </div>
    );
  }
  const filteredMosques = mosqueData.filter((mosque) => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    const mosqueName = (mosque.mosqueName || "").toLowerCase();
    const city = (mosque.city || "").toLowerCase();

    return searchTerms.every(
      (term) => mosqueName.includes(term) || city.includes(term)
    );
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 text-black p-4">
      <div className="w-full max-w-md mb-6 mt-4">
        <input
          type="text"
          placeholder="Cari masjid berdasarkan nama atau bandar..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center justify-center md:flex-row md:flex-wrap w-full">
        {filteredMosques.length > 0 ? (
          filteredMosques.map((mosque) => (
            <div
              key={mosque.id}
              className="w-60 bg-white overflow-hidden rounded shadow-md m-4 p-4 text-center"
              onClick={() => onClick(mosque.id)}
              style={{ cursor: "pointer" }}>
              <Image
                src={mosque.imageUrl}
                alt={mosque.mosqueName}
                width={300}
                height={300}
                className="rounded w-60 h-40 object-cover mb-4"
              />
              <h2 className="text-xl font-bold">{mosque.mosqueName}</h2>
              <p>{mosque.addressLine1}</p>
              <p>{mosque.addressLine2}</p>
              <p>{mosque.city}</p>
              <p>{mosque.state}</p>
              <p>{mosque.postalCode}</p> {/* Ubah dari zipcode ke postalCode */}
            </div>
          ))
        ) : (
          <div className="text-gray-500 mt-4">
            Tidak ada masjid yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
};
