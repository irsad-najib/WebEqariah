"use client";

import React, { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { axiosInstance } from "@/lib/utils/api";
import { handleError } from "@/lib/utils/errorHandler";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, closeToast, success, error } = useToast();

  const token = useMemo(() => {
    return (searchParams.get("token") || "").trim();
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      error("Token tidak sah", "Sila guna link dari email reset.");
      return;
    }

    if (newPassword.length < 8) {
      error("Ralat", "Password minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("Ralat", "Password tidak sama");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post(
        "/api/auth/reset-password",
        { token, new_password: newPassword },
        { withCredentials: true },
      );

      success("Berjaya", "Kata laluan berjaya ditukar. Sila login semula.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      const appError = handleError(err);
      error(appError.message, appError.description || "Reset password gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <Navbar />
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 flex items-center justify-center p-[6%]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Tetapkan kata laluan baru
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Masukkan kata laluan baru untuk akaun anda.
              </p>
            </div>

            {!token && (
              <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                Token tidak dijumpai. Pastikan anda membuka link dari email
                reset.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Password baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Minimum 8 karakter"
                  required
                  disabled={loading || !token}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Sahkan password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ulang password"
                  required
                  disabled={loading || !token}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-300 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg">
                {loading ? "Menyimpan..." : "Simpan password baru"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              <a
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium transition-colors">
                Kembali ke login
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
