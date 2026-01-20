"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";
import { fetchBidangIlmu, type BidangIlmu } from "@/lib/api/bidangIlmu";

interface EditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  announcement: {
    id: number;
    title: string;
    content: string;
    mediaUrl?: string;
    type?: string;
    speaker_name?: string;
    event_date?: string;
    kitab_id?: number;
    kitab_title?: string;
    bidang_ilmu?: string;
  };
}

export const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  announcement,
}) => {
  const [formData, setFormData] = useState({
    title: announcement.title || "",
    content: announcement.content || "",
    mediaUrl: announcement.mediaUrl || "",
    type: announcement.type || "",
    speaker_name: announcement.speaker_name || "",
    event_date: announcement.event_date || "",
    kitab_id: announcement.kitab_id || undefined,
    kitab_title: announcement.kitab_title || "",
    bidang_ilmu: announcement.bidang_ilmu || "",
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

  // Reset form data when announcement changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        mediaUrl: announcement.mediaUrl || "",
        type: announcement.type || "",
        speaker_name: announcement.speaker_name || "",
        event_date: announcement.event_date || "",
        kitab_id: announcement.kitab_id || undefined,
        kitab_title: announcement.kitab_title || "",
        bidang_ilmu: announcement.bidang_ilmu || "",
      });
      setError("");
      setSuccess("");
    }
  }, [isOpen, announcement]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      const response = await axiosInstance.put(
        `/api/announcement/${announcement.id}`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setSuccess(response.data.message || "Announcement berhasil diupdate!");

        // Call onSuccess callback after 1.5 seconds
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const respData = err.response?.data;

      if (status === 403) {
        setError("Kamu bukan pemilik data ini");
      } else if (status === 404) {
        setError("Announcement tidak ditemukan");
      } else {
        const serverMessage =
          respData?.error ||
          respData?.message ||
          (typeof respData === "string" ? respData : null);
        setError(
          serverMessage || "Gagal mengupdate announcement. Silakan coba lagi.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isKajian = formData.type === "kajian";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Edit Announcement
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

          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Content Field */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Kajian-specific fields */}
          {isKajian && (
            <>
              {/* Speaker Name */}
              <div>
                <label
                  htmlFor="speaker_name"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Ustadz
                </label>
                <input
                  type="text"
                  id="speaker_name"
                  name="speaker_name"
                  value={formData.speaker_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Event Date */}
              <div>
                <label
                  htmlFor="event_date"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Kajian
                </label>
                <input
                  type="datetime-local"
                  id="event_date"
                  name="event_date"
                  value={
                    formData.event_date
                      ? new Date(formData.event_date).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Kitab Title */}
              <div>
                <label
                  htmlFor="kitab_title"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Kitab
                </label>
                <input
                  type="text"
                  id="kitab_title"
                  name="kitab_title"
                  value={formData.kitab_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Bidang Ilmu */}
              <div>
                <label
                  htmlFor="bidang_ilmu"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Bidang Ilmu
                </label>
                <select
                  id="bidang_ilmu"
                  name="bidang_ilmu"
                  value={formData.bidang_ilmu}
                  onChange={handleChange}
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
                </select>
              </div>
            </>
          )}

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
              disabled={loading || !formData.title || !formData.content}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
