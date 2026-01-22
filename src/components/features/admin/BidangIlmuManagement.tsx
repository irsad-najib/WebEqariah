"use client";
import React, { useState, useEffect } from "react";
import { Trash2, User, AlertCircle, Check } from "lucide-react";
import {
  fetchBidangIlmu,
  deleteBidangIlmu,
  type BidangIlmu,
} from "@/lib/api/bidangIlmu";

export const BidangIlmuManagement: React.FC = () => {
  const [bidangIlmuList, setBidangIlmuList] = useState<BidangIlmu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Fetch bidang ilmu on mount
  useEffect(() => {
    loadBidangIlmu();
  }, []);

  const loadBidangIlmu = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBidangIlmu();
      setBidangIlmuList(data);
    } catch (err) {
      console.error("Failed to fetch bidang ilmu:", err);
      setError("Gagal memuat data bidang ilmu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await deleteBidangIlmu(id);
      setSuccess("Bidang ilmu berhasil dihapus");
      setBidangIlmuList((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirmId(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || "Gagal menghapus bidang ilmu";
      setError(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pengurusan Bidang Ilmu
        </h2>
        <p className="text-gray-600">
          Lihat dan urus semua bidang ilmu yang telah didaftarkan
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {bidangIlmuList.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Tiada Bidang Ilmu
          </h3>
          <p className="text-gray-600">
            Belum ada bidang ilmu yang didaftarkan
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Penerangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Dicipta Oleh
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bidangIlmuList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">{item.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-md">
                      {item.description || (
                        <span className="text-gray-400 italic">
                          Tiada penerangan
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-green-700" />
                      </div>
                      <span className="text-sm text-gray-700">
                        User ID: {item.created_by}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-600 mr-2">
                          Pasti?
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold">
                          {deletingId === item.id ? "..." : "Ya, Hapus"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId !== null}
                        className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Nota:</strong> Hanya pemilik bidang ilmu yang boleh
          menghapusnya. Sekiranya anda cuba menghapus bidang ilmu milik orang
          lain, operasi akan digagalkan.
        </p>
      </div>
    </div>
  );
};
