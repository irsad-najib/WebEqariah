"use client";

import React from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 w-auto text-center">
        <h1 className="text-8xl font-bold text-green-600 mb-4">404</h1>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6 text-2xl">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            We're sorry, the page you're looking for doesn't exist or has been
            moved.
          </p>

          <div className="w-full mx-auto">
            <Image
              src="/404.svg"
              alt="404 Illustration"
              className="mx-auto mb-6"
              width={1000}
              height={1000}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            <Home size={20} />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
      {/* <div className="mt-8 text-gray-500 text-sm">
        <p>
          Need help?
          <Link href="/contact" className="text-green-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div> */}
    </div>
  );
};

export default NotFound;
