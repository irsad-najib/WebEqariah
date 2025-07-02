// "use client";
// import { useRouter } from "next/navigation";
// import Mosque from "./component/mosque";
// import Navbar from "./component/navbar";

// const Homepage = () => {
//   const router = useRouter();

//   const handleMosqueClick = (id: number | string) => {
//     router.push(`/mosque/${id}`);
//   };

//   return (
//     <>
//       <Navbar />
//       <Mosque onClick={handleMosqueClick} />
//     </>
//   );
// };

// export default Homepage;
"use client";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Construction Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-16 h-16 text-gray-800"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Under Construction
        </h1>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Kami sedang membangun sesuatu yang luar biasa untuk Anda.
          <br />
          Website akan segera hadir!
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-sm animate-pulse"
            style={{ width: "75%" }}
          ></div>
        </div>

        <p className="text-sm text-gray-500 mb-8">75% Complete</p>

        {/* Footer */}
        <p className="text-sm text-gray-400">
          © 2025 Eqariah. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Homepage;
