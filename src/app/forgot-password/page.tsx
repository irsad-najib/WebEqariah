"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { axiosInstance } from "@/lib/utils/api";
import { handleError } from "@/lib/utils/errorHandler";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { toasts, closeToast, success, error, info } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      error("Ralat", "Sila masukkan email");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(
        "/api/auth/forgot-password",
        { email: normalized },
        { withCredentials: true },
      );

      // Backend intentionally always returns success.
      success(
        "Permintaan dihantar",
        "Jika email anda wujud, kami akan hantar pautan reset kata laluan.",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      const appError = handleError(err);
      // Still show a neutral info message to avoid enumeration.
      info(
        "Permintaan diterima",
        appError.description ||
          "Jika email anda wujud, kami akan hantar pautan reset kata laluan.",
      );
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
                Lupa kata laluan
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Masukkan email untuk terima pautan reset.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="contoh: user@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-300 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg">
                {loading ? "Menghantar..." : "Hantar pautan reset"}
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

export default ForgotPasswordPage;
