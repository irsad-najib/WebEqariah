"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";

interface Kitab {
  id: number;
  judul: string;
  pengarang: string;
  bidang_ilmu: string;
  mazhab: string;
}

interface KitabSelectProps {
  value?: number | null;
  onChange: (kitabId: number | null, kitabTitle: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const KitabSelect: React.FC<KitabSelectProps> = ({
  value,
  onChange,
  placeholder = "Pilih Kitab...",
  disabled = false,
}) => {
  const [kitabs, setKitabs] = useState<Kitab[]>([]);
  const [filteredKitabs, setFilteredKitabs] = useState<Kitab[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKitab, setSelectedKitab] = useState<Kitab | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch approved kitabs
  useEffect(() => {
    const fetchKitabs = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/kitab/approved", {
          withCredentials: true,
        });
        if (response.data.success) {
          setKitabs(response.data.data);
          setFilteredKitabs(response.data.data);
        } else {
          // Fallback if API doesn't have success field
          const data = Array.isArray(response.data) ? response.data : [];
          setKitabs(data);
          setFilteredKitabs(data);
        }
      } catch (err) {
        console.error("Failed to fetch kitabs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKitabs();
  }, []);

  // Set selected kitab based on value prop
  useEffect(() => {
    if (value && kitabs.length > 0) {
      const kitab = kitabs.find((k) => k.id === value);
      if (kitab) {
        setSelectedKitab(kitab);
      }
    }
  }, [value, kitabs]);

  // Filter kitabs based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredKitabs(kitabs);
    } else {
      const filtered = kitabs.filter(
        (kitab) =>
          kitab.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kitab.pengarang
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredKitabs(filtered);
    }
  }, [searchTerm, kitabs]);

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

  const handleSelect = (kitab: Kitab) => {
    setSelectedKitab(kitab);
    onChange(kitab.id, kitab.judul);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKitab(null);
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
        <span className={selectedKitab ? "text-gray-900" : "text-gray-400"}>
          {selectedKitab ? selectedKitab.judul : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedKitab && !disabled && (
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
                placeholder="Cari kitab..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Kitab List */}
          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading kitab...
              </div>
            ) : filteredKitabs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? "Tidak ada kitab ditemukan"
                  : "Belum ada kitab yang approved"}
              </div>
            ) : (
              filteredKitabs.map((kitab) => (
                <button
                  key={kitab.id}
                  type="button"
                  onClick={() => handleSelect(kitab)}
                  className={`w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedKitab?.id === kitab.id ? "bg-green-50" : ""
                  }`}>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {kitab.judul}
                    </div>
                    <div className="text-sm text-gray-600">
                      Pengarang: {kitab.pengarang}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {kitab.bidang_ilmu} • {kitab.mazhab}
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
