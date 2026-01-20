"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";
import {
  createBidangIlmu,
  type CreateBidangIlmuRequest,
} from "@/lib/api/bidangIlmu";

interface RegisterBidangIlmuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterBidangIlmuModal: React.FC<
  RegisterBidangIlmuModalProps
> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateBidangIlmuRequest>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      const response = await createBidangIlmu(formData);

      if (response.success) {
        setSuccess("Bidang Ilmu berjaya didaftarkan!");
        setFormData({
          name: "",
          description: "",
        });

        // Call onSuccess callback after 1.5 seconds
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("RegisterBidangIlmu API error:", err);
      const status = err.response?.status;
      const respData = err.response?.data;

      const serverMessage =
        respData?.message ||
        respData?.error ||
        (typeof respData === "string" ? respData : null);

      if (serverMessage) {
        setError(String(serverMessage));
      } else {
        setError("Gagal mendaftarkan bidang ilmu. Sila cuba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Daftar Bidang Ilmu Baru
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

          {/* Nama Bidang Ilmu Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1">
              Nama Bidang Ilmu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Fiqih"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1">
              Penerangan (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Penerangan ringkas mengenai bidang ilmu ini"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
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
              disabled={loading || !formData.name}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
