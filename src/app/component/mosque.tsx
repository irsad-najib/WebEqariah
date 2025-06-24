"use client";
import axiosInstance from "./API";
import React, { useEffect, useState } from "react";
import Image from "next/image";

type Mosque = {
  id: number;
  mosqueName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  imageUrl: string;
};

type MosqueProps = {
  onClick: (id: number) => void;
};
const Mosque: React.FC<MosqueProps> = ({ onClick }) => {
  const [mosqueData, setMosqueData] = useState<Mosque[]>([]);
  useEffect(() => {
    const fetchMosque = async () => {
      try {
        const response = await axiosInstance.get("/api/mosque");
        console.log(response.data);
        setMosqueData(response.data);
      } catch (error) {
        console.error("Error fetching mosque data:", error);
      }
    };
    fetchMosque();
  }, []);

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
          <p>{mosque.zipcode}</p>
        </div>
      ))}
    </div>
  );
};

export default Mosque;
