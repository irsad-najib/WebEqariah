"use client";
import Link from "next/link";
import { Home } from "lucide-react";
import Image from "next/image";

const WaitingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
      <div className="bg-white text-2xl shadow-md rounded-lg p-8 ">
        <h1 className="text-4xl font-bold text-center mb-4 text-green-500">
          Pendaftaran Berjaya!
        </h1>
        <Image
          src="/registration-success.png"
          alt="registration Illustration"
          className="mx-auto mb-6"
          width={800}
          height={800}
        />
        <p className="text-gray-700 text-center mb-4">
          Terima kasih kerana mendaftar.
        </p>
        <p className="text-gray-700 text-center">
          Jika anda mempunyai sebarang pertanyaan lanjut, sila hubungi kami.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            <Home size={20} />
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
