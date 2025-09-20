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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black md:flex-row">
      {mosqueData.map((mosque) => (
        <div
          key={mosque.id}
          className="w-60 bg-white overflow-hidden rounded shadow-md m-4 p-4 text-center"
          onClick={() => onClick(mosque.id)}
          style={{ cursor: "pointer" }}
        >
          <Image
            src={mosque.imageUrl}
            alt={mosque.mosqueName}
            width={300}
            height={300}
            className="rounded "
          />
          <h2 className="text-xl font-bold">{mosque.mosqueName}</h2>
          <p>{mosque.addressLine1}</p>
          <p>{mosque.addressLine2}</p>
          <p>{mosque.city}</p>
          <p>{mosque.state}</p>
          <p>{mosque.postalCode}</p> {/* Ubah dari zipcode ke postalCode */}
        </div>
      ))}
    </div>
  );
};
