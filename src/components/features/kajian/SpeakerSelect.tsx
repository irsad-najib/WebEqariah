"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";
import Image from "next/image";

interface Speaker {
  id: number;
  name: string;
  bio?: string;
  expertise?: string;
  photo_url?: string;
  status: string;
}

interface SpeakerSelectProps {
  value?: number | null;
  onChange: (speakerId: number | null, speakerName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SpeakerSelect: React.FC<SpeakerSelectProps> = ({
  value,
  onChange,
  placeholder = "Pilih Ustadz...",
  disabled = false,
}) => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch approved speakers
  useEffect(() => {
    const fetchSpeakers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/speaker/approved", {
          withCredentials: true,
        });
        if (response.data.success) {
          setSpeakers(response.data.data);
          setFilteredSpeakers(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch speakers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  // Set selected speaker based on value prop
  useEffect(() => {
    if (value && speakers.length > 0) {
      const speaker = speakers.find((s) => s.id === value);
      if (speaker) {
        setSelectedSpeaker(speaker);
      }
    }
  }, [value, speakers]);

  // Filter speakers based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSpeakers(speakers);
    } else {
      const filtered = speakers.filter(
        (speaker) =>
          speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          speaker.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpeakers(filtered);
    }
  }, [searchTerm, speakers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    onChange(speaker.id, speaker.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSpeaker(null);
    onChange(null, "");
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Select Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full px-4 py-2 text-left bg-white border rounded-lg flex items-center justify-between ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        } ${
          isOpen ? "border-green-500 ring-2 ring-green-500" : "border-gray-300"
        }`}>
        <span className={selectedSpeaker ? "text-gray-900" : "text-gray-400"}>
          {selectedSpeaker ? selectedSpeaker.name : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedSpeaker && !disabled && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ustadz..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Speaker List */}
          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading ustaz...
              </div>
            ) : filteredSpeakers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? "Tidak ada ustaz ditemukan"
                  : "Belum ada ustaz yang approved"}
              </div>
            ) : (
              filteredSpeakers.map((speaker) => (
                <button
                  key={speaker.id}
                  type="button"
                  onClick={() => handleSelect(speaker)}
                  className={`w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedSpeaker?.id === speaker.id ? "bg-green-50" : ""
                  }`}>
                  <div className="flex items-center gap-3">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {speaker.name}
                      </div>
                      {speaker.expertise && (
                        <div className="text-sm text-gray-500">
                          {speaker.expertise}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
