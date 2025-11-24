import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils/api";

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

// Main navigation links - hapus Profile karena sudah ada di dropdown
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
    href: "/message",
    children: "Messages",
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
  // Profile dihapus karena sudah ada di profile dropdown
];

// Additional feature links (for logged in users)
const featureLinks = [
  {
    href: "#",
    children: "Prayer Time",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "#",
    children: "Qibla",
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
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    href: "/marketplace",
    children: "Marketplace",
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
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    href: "#",
    children: "Infaq",
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
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    ),
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        const isAuthenticated = auth.data.Authenticated === true;
        setIsLogin(isAuthenticated);
        setCurrentUser(auth.data.user);
      } catch (error) {
        console.log("Auth error:", error);
        setIsLogin(false);
        setCurrentUser(null);
      }
    };

    // Check login status saat mount
    checkLoginStatus();

    // Set interval untuk periodic check (setiap 5 menit)
    // Tapi skip interval check kalau user di halaman login/register
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isAuthPage =
      currentPath === "/login" ||
      currentPath === "/register" ||
      currentPath === "/register-mosque";

    // Hanya set interval jika BUKAN di halaman auth
    let intervalId: NodeJS.Timeout | undefined;
    if (!isAuthPage) {
      intervalId = setInterval(checkLoginStatus, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("api/auth/logout", {
        withCredentials: true,
      });
      setIsLogin(false);
      setCurrentUser(null);
      setIsOpen(false);
      setIsDropdownOpen(false);
      setIsProfileDropdownOpen(false);
      router.replace("/");
    } catch (err) {
      console.log(err);
    }
  };

  const closeMenu = () => setIsOpen(false);
  const closeDropdown = () => setIsDropdownOpen(false);
  const closeProfileDropdown = () => setIsProfileDropdownOpen(false);

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

              {/* Dashboard Link - Only for logged in users */}
              {isLogin && (
                <NavLink
                  href="/dashboard"
                  className="text-white text-lg hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                  icon={
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
                        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                  }>
                  Dashboard
                </NavLink>
              )}

              {/* Features Dropdown (only for logged in users) */}
              {isLogin && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-white text-lg hover:bg-white/10 px-3 py-2 rounded-lg transition-all">
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
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    Features
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Features Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      {/* Dropdown Overlay */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={closeDropdown}
                      />

                      {/* Dropdown Content */}
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        {featureLinks.map(({ href, children, icon }) => (
                          <Link
                            key={children}
                            href={href}
                            onClick={closeDropdown}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="text-gray-500">{icon}</span>
                            {children}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Auth Section */}
            {isLogin ? (
              <div className="relative">
                {/* Profile Button */}
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm">
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {currentUser?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold leading-tight">
                      {currentUser?.username || "User"}
                    </p>
                    <p className="text-white/70 text-xs leading-tight">
                      {currentUser?.email?.split("@")[0] || "user"}
                    </p>
                  </div>

                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 text-white/70 transition-transform ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    {/* Dropdown Overlay */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={closeProfileDropdown}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-[#4caf4f] to-[#45a049] p-4 text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">
                              {currentUser?.username?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {currentUser?.username || "User"}
                            </p>
                            <p className="text-white/80 text-sm">
                              {currentUser?.email || "user@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Dashboard Link */}
                        <Link
                          href="/dashboard"
                          onClick={closeProfileDropdown}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="text-gray-500">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                            />
                          </svg>
                          <span className="font-medium">Dashboard</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={closeProfileDropdown}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="text-gray-500">
                            <circle cx="12" cy="8" r="4" strokeWidth="2" />
                            <path
                              d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4"
                              strokeWidth="2"
                            />
                          </svg>
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={closeProfileDropdown}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="text-gray-500">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="font-medium">Settings</span>
                        </Link>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-2"></div>

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="text-red-500">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
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
            )}
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

          {/* User Info (if logged in) */}
          {isLogin && currentUser && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {currentUser.username?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{currentUser.username}</p>
                  <p className="text-sm text-white/80 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}
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

            {/* Dashboard Link - Only for logged in users */}
            {isLogin && (
              <NavLink
                href="/dashboard"
                onClick={closeMenu}
                className="w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                icon={
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
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                }>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Feature Links (only for logged in users) */}
          {isLogin && (
            <div className="mt-8 space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Features
              </h3>
              {featureLinks.map(({ href, children, icon }) => (
                <NavLink
                  key={children}
                  href={href}
                  onClick={closeMenu}
                  className="w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  icon={icon}>
                  {children}
                </NavLink>
              ))}
            </div>
          )}

          {/* Auth Section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            {isLogin ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            ) : (
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
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
