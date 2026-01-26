"use client";
import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import axios from "axios";
import { axiosInstance } from "@/lib/utils/api";
import { fetchBidangIlmu, type BidangIlmu } from "@/lib/api/bidangIlmu";

interface RegisterKitabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface KitabFormData {
  judul: string;
  pengarang: string;
  bidang_ilmu: string;
  mazhab: string;
}

const MAZHAB_OPTIONS = [
  "Syafi'i",
  "Hanafi",
  "Maliki",
  "Hanbali",
  "Tidak Spesifik Mazhab",
];

export const RegisterKitabModal: React.FC<RegisterKitabModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<KitabFormData>({
    judul: "",
    pengarang: "",
    bidang_ilmu: "",
    mazhab: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bidangIlmuOptions, setBidangIlmuOptions] = useState<BidangIlmu[]>([]);
  const [loadingBidangIlmu, setLoadingBidangIlmu] = useState(true);

  // Fetch bidang ilmu on mount
  useEffect(() => {
    const loadBidangIlmu = async () => {
      setLoadingBidangIlmu(true);
      try {
        const data = await fetchBidangIlmu();
        setBidangIlmuOptions(data);
      } catch (err) {
        console.error("Failed to fetch bidang ilmu:", err);
      } finally {
        setLoadingBidangIlmu(false);
      }
    };

    if (isOpen) {
      loadBidangIlmu();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await axiosInstance.post(
        "/api/kitab/register",
        formData,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setSuccess(response.data.message || "Kitab berjaya didaftarkan!");
        setFormData({
          judul: "",
          pengarang: "",
          bidang_ilmu: "",
          mazhab: "",
        });

        // Call onSuccess callback after 1.5 seconds
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const respData = err.response?.data;
        console.error("RegisterKitab API error:", status, respData);

        const serverMessage =
          respData?.message ||
          respData?.error ||
          (typeof respData === "string" ? respData : null);

        if (serverMessage) {
          setError(String(serverMessage));
        } else {
          setError(
            `Server responded with status ${status}${
              status === 404 ? " (Not Found - check backend endpoint)" : ""
            }`,
          );
        }
      } else {
        console.error("Unknown error registering kitab:", err);
        setError("Gagal mendaftarkan kitab. Sila cuba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Daftarkan Kitab Baru
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Judul Kitab Field */}
          <div>
            <label
              htmlFor="judul"
              className="block text-sm font-medium text-gray-700 mb-1">
              Tajuk Kitab <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              required
              placeholder="Contoh: Fiqhus Sunnah"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Pengarang Field */}
          <div>
            <label
              htmlFor="pengarang"
              className="block text-sm font-medium text-gray-700 mb-1">
              Pengarang Kitab <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pengarang"
              name="pengarang"
              value={formData.pengarang}
              onChange={handleChange}
              required
              placeholder="Contoh: As-Sayyid Sabiq"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Bidang Ilmu Field */}
          <div>
            <label
              htmlFor="bidang_ilmu"
              className="block text-sm font-medium text-gray-700 mb-1">
              Bidang Ilmu <span className="text-red-500">*</span>
            </label>
            <select
              id="bidang_ilmu"
              name="bidang_ilmu"
              value={formData.bidang_ilmu}
              onChange={handleChange}
              required
              disabled={loadingBidangIlmu}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">
                {loadingBidangIlmu
                  ? "Memuat bidang ilmu..."
                  : "Pilih Bidang Ilmu..."}
              </option>
              {bidangIlmuOptions.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
              {!loadingBidangIlmu && bidangIlmuOptions.length === 0 && (
                <option value="" disabled>
                  Tidak ada bidang ilmu tersedia
                </option>
              )}
            </select>
          </div>

          {/* Mazhab Field */}
          <div>
            <label
              htmlFor="mazhab"
              className="block text-sm font-medium text-gray-700 mb-1">
              Mazhab <span className="text-red-500">*</span>
            </label>
            <select
              id="mazhab"
              name="mazhab"
              value={formData.mazhab}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Pilih Mazhab...</option>
              {MAZHAB_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Batal
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.judul ||
                !formData.pengarang ||
                !formData.bidang_ilmu ||
                !formData.mazhab
              }
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Mendaftar..." : "Daftar Kitab"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
