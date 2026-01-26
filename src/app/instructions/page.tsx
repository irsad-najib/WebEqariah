"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  Building2,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const Instructions = () => {
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Bagaimanakah saya boleh mendaftar untuk akaun?",
      answer:
        'Klik butang "Register" di penjuru kanan sebelah atas, isikan butiran anda termasuk nama pengguna, email dan kata laluan, kemudian hantarkan.',
    },
    {
      question:
        "Apakah perbezaan antara akaun pengguna dan akaun pentadbir masjid?",
      answer:
        "Pengguna tetap boleh melihat pengumuman dan menyertai sembang komuniti. Pentadbir masjid juga boleh mencipta dan mengurus pengumuman untuk masjid mereka.",
    },
    {
      question: "Bagaimanakah saya boleh mendaftar masjid saya?",
      answer:
        'Navigasi ke "Register Mosque" daripada dashboard, isikan semua maklumat yang diperlukan tentang masjid anda dan serahkan untuk kelulusan pentadbir sistem.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full mb-6">
                <Info className="w-12 h-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Cara Menggunakan Eqariah
              </h1>
              <p className="text-xl text-blue-100">
                Panduan komprehensif untuk anda bermula dengan platform kami
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Tab Selector */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("user")}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}>
                <User className="w-5 h-5" />
                Untuk Pengguna
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "admin"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}>
                <Building2 className="w-5 h-5" />
                Untuk Pentadbir Masjid
              </button>
            </div>
          </div>

          {/* User Instructions */}
          {activeTab === "user" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Cipta Akaun Anda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Mulakan dengan mendaftar untuk akaun. Anda perlu menyediakan:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Nama pengguna yang unik</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Alamat email anda</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Kata laluan</span>
                      </li>
                    </ul>
                    <a
                      href="/register"
                      className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                      Daftar Sekarang
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-blue-600" />
                      Lihat Pengumuman
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Setelah login, anda akan melihat dashboard anda dengan
                      pengumuman daripada masjid yang anda ikuti. Setiap pengumuman
                      termasuk:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Tajuk dan kandungan terperinci</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Imej atau lampiran media</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Tarikh dan masa pengeposan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Maklumat masjid</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      Join Community Chats
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Connect with other community members through the chat
                      feature:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Access the chat sidebar on your dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Send messages to your mosque community</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Participate in discussions and ask questions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Build meaningful connections</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div> */}

              {/* Step 4 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Cari Masjid
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Layari Masjid:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                        Lawati halaman senarai masjid untuk melihat semua masjid berdaftar
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Lihat maklumat terperinci tentang setiap masjid</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mosque Admin Instructions */}
          {activeTab === "admin" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Daftarkan Masjid Anda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Sebelum membuat pengumuman, anda perlu mendaftarkan masjid anda:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Navigasi ke &quot;Daftar Masjid&quot; dalam dashboard
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                        Isi semua maklumat yang diperlukan (nama, alamat, butiran perhubungan)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Unggah imej masjid anda</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Tunggu kelulusan admin (biasanya dalam masa 24 jam)
                        </span>
                      </li>
                    </ul>
                    <a
                      href="/register-mosque"
                      className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold">
                      Daftarkan Masjid →
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Akses Dashboard Pentadbir
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ketika masjid anda telah diapprove dan anda ditetapkan sebagai pentadbir:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Login dengan kelayakan akaun pentadbir masjid anda
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Anda akan dialihkan secara automatik ke dashboard pentadbir anda
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Lihat profil dan statistik komuniti masjid anda
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-green-600" />
                      Lihat profil dan statistik masjid anda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Cipta pengumuman untuk komuniti masjid anda:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Pada Dashboard "Cipta Pengumuman Baharu" akan muncul
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Tambahkan tajuk yang jelas dan deskriptif</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Tulis isi pengumuman anda
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Secara pilihan, tambahkan imej atau media</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Pratonton dan terbitkan dengan klik "Create announcement"
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              {/* <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Manage Your Community
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Keep your community engaged and informed:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Monitor community chat and participate in discussions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>View announcement engagement and reach</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Update mosque information as needed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Respond to community questions and feedback</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Frequently Asked Questions
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-600 mx-auto"></div>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200">
                    <span className="font-semibold text-gray-800">
                      {faq.question}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Need Help Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Masih Perlukan Bantuan?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Team kami sedia membantu anda dengan sebarang pertanyaan
              </p>
              <a
                href="mailto:gammanasim@gmail.com"
                className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Instructions;
