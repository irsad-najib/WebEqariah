import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "./API";

const navLinks = [
  { href: "/profile", label: "Profile", icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke="#3B82F6" strokeWidth="2" />
      <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#3B82F6" strokeWidth="2" />
    </svg>
  ) },
  { href: "#", label: "Prayer Time", icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) },
  { href: "#", label: "Kibla'", icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#F59E42" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="#F59E42" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) },
  { href: "#", label: "Marketplace", icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="#6366F1" strokeWidth="2" />
      <path d="M16 3v4M8 3v4" stroke="#6366F1" strokeWidth="2" />
    </svg>
  ) },
  { href: "#", label: "Infaq", icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="8" stroke="#F43F5E" strokeWidth="2" />
      <path d="M12 8v4l3 3" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) },
  { href: "#", label: "Offer", icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="#FBBF24" strokeWidth="2" />
      <path d="M8 12h8" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) },
];


const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-4">
      <nav className="flex-1">
        <ul className="flex flex-col gap-2 h-full">
          {navLinks.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <span>{item.icon}</span>
                <span className="text-gray-800 dark:text-gray-100 font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
