"use client";
import React from "react";
import Image from "next/image";

const Settings = () => {
  return (
    <div className="bg-gray-200 text-black ">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mt-4">Settings</h1>
        <p className="text-lg text-green-700">Settings content goes here</p>
      </div>
    </div>
  );
};
const Mosque = () => {
  return (
    <div className="bg-gray-200 text-black ">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mt-4">Mosque</h1>
        <p className="text-lg text-green-700">Mosque content goes here</p>
      </div>
    </div>
  );
};

const Profile = () => {
  const [activePage, setActivePage] = React.useState("Settings");

  const handlePageChange = () => {
    switch (activePage) {
      case "Mosque":
        return <Mosque />;
      case "Settings":
        return <Settings />;
      default:
        return null;
    }
  };
  return (
    <div className="flex h-screen text-black">
      <div className="w-1/4 bg-gray-200 border-r flex flex-col items-center py-20 relative">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="w-40 h-40 rounded-full overflow-auto border-2 shadow-xl mb-4">
          <Image
            src="/bx-user.svg"
            width={1000}
            height={1000}
            alt="User Icon"
            className="object-scale-down w-full h-full"
          />
        </div>
        <h1 className="text-lg mb-10">nama</h1>
        <ul className="mt-4 space-y-3 text-lg items-center justify-center text-center">
          <li
            className={`hover:bg-gray-300 hover:px-20 hover:py-4 cursor-pointer ${
              activePage === "Settings"
                ? "border rounded-lg bg-gray-300 px-20 py-4 items-center"
                : ""
            }`}
            onClick={() => setActivePage("Settings")}
          >
            Settings
          </li>
          <li
            className={`hover:bg-gray-300 hover:px-20 hover:py-4 cursor-pointer ${
              activePage === "Mosque"
                ? "border rounded-lg bg-gray-300 px-20 py-4 items-center"
                : ""
            }`}
            onClick={() => setActivePage("Mosque")}
          >
            Mosque
          </li>
        </ul>
        <div className="absolute top-[5%] right-0 h-[90%] w-[3px] bg-black" />
      </div>
      <div className="flex-1">{handlePageChange()}</div>
    </div>
  );
};
export default Profile;
