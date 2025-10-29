import React from "react";
import Image from "next/image";

export const UnderConstruction: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-8">
          {/* You can replace this with your own construction/maintenance image */}
          <Image
            src="/under-construktion.PNG"
            alt="Under Construction"
            width={500}
            height={500}
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Under Construction
        </h1>

        <p className="text-gray-600 mb-8">
          We&#39;re working hard to improve this page and will be back soon with
          a brand new experience. Thank you for your patience!
        </p>
      </div>

      <div className="mt-16 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Eqariah. All rights reserved.
      </div>
    </div>
  );
};
