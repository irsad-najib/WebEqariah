"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({
  href,
  children,
  className = "",
  icon,
  onClick,
}: NavLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 hover:text-gray-200 transition-colors duration-200 ${className}`}>
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </Link>
);

// Main navigation links - simplified
const mainNavLinks = [
  {
    href: "/",
    children: "Home",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/instructions",
    children: "How to Use",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/masjid",
    children: "Masjid/Surau",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v2m0 0l3 3m-3-3L9 8m3-3v13m-7 0h14a1 1 0 001-1v-7a1 1 0 00-.553-.894l-6.447-3.224a1 1 0 00-.894 0l-6.447 3.224A1 1 0 003 10v7a1 1 0 001 1z"
        />
      </svg>
    ),
  },
  {
    href: "/register-mosque",
    children: "Register Mosque",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v2m0 0l3 3m-3-3L9 8m3-3v13m-7 0h14a1 1 0 001-1v-7a1 1 0 00-.553-.894l-6.447-3.224a1 1 0 00-.894 0l-6.447 3.224A1 1 0 003 10v7a1 1 0 001 1z"
        />
      </svg>
    ),
  },
  {
    href: "/message",
    children: "Message",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    href: "/overview",
    children: "Overview",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];



export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-[#4caf4f] py-3 lg:py-4 sticky top-0 z-50 shadow-lg">
        <div className="w-full flex justify-between items-center px-4 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/eqariah.svg"
              width={32}
              height={32}
              alt="Eqariah logo"
              className="w-8 h-8 object-contain"
              priority
            />
            <NavLink
              href="/"
              className="text-white text-xl lg:text-2xl font-bold truncate"
              onClick={closeMenu}>
              Eqariah
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {/* Main Navigation Links */}
              {mainNavLinks.map(({ href, children, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  className="text-white text-lg hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                  icon={icon}>
                  {children}
                </NavLink>
              ))}
            </div>

            {/* Sign In Button */}
            <NavLink
              href="/login"
              className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl transition-all font-medium backdrop-blur-sm border border-white/20">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </NavLink>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white focus:outline-none p-2"
            aria-label="Toggle menu">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Sidebar Header */}
        <div className="bg-[#4caf4f] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/eqariah.svg"
                width={28}
                height={28}
                alt="Eqariah logo"
                className="w-7 h-7"
              />
              <span className="text-xl font-bold">Eqariah</span>
            </div>
            <button
              onClick={closeMenu}
              className="text-white hover:bg-white/20 p-2 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            {mainNavLinks.map(({ href, children, icon }) => (
              <NavLink
                key={href}
                href={href}
                onClick={closeMenu}
                className="w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                icon={icon}>
                {children}
              </NavLink>
            ))}
          </div>

          {/* Auth Section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <NavLink
              href="/login"
              onClick={closeMenu}
              className="w-full p-3 text-[#4caf4f] hover:bg-green-50 rounded-lg transition-colors font-semibold"
              icon={
                <Image
                  src="/bx-user.svg"
                  width={20}
                  height={20}
                  alt="User Icon"
                  className="w-5 h-5"
                />
              }>
              Sign In
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};
