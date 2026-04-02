"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { fetchBidangIlmu, type BidangIlmu } from "@/lib/api/bidangIlmu";
import { useAuth } from "@/lib/hooks/useAuth";

const BIDANG_ILMU_STORAGE_KEY = "eqariah_bidang_ilmu";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink = ({ href, children, className = "", onClick }: NavLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`transition-colors duration-200 ${className}`}
  >
    {children}
  </Link>
);

// Main navigation links - simplified
const mainNavLinks = [
  {
    href: "/dashboard",
    children: "Dashboard",
  },
  {
    href: "/masjid",
    children: "Masjid/Surau",
  },
  {
    href: "/ustadz",
    children: "Ustaz",
  },
  {
    href: "/kitab",
    children: "Kitab",
  },
  {
    href: "/instructions",
    children: "Cara Penggunaan",
  },
];

export const Navbar = () => {
  return (
    <Suspense fallback={<div className="h-14 bg-white" />}>
      <NavbarInner />
    </Suspense>
  );
};

const NavbarInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const showBidangIlmuDropdown = true;
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const bidangIlmuFromUrl = searchParams.get("bidang_ilmu") ?? "";
  const [selectedBidangIlmu, setSelectedBidangIlmu] = useState<string>("");
  const [bidangIlmuOptions, setBidangIlmuOptions] = useState<BidangIlmu[]>([]);

  useEffect(() => {
    const loadBidangIlmu = async () => {
      try {
        const data = await fetchBidangIlmu();
        setBidangIlmuOptions(data);
      } catch (err) {
        console.error("Failed to fetch bidang ilmu:", err);
      }
    };
    loadBidangIlmu();
  }, []);

  useEffect(() => {
    // Prefer URL param when present; otherwise fallback to sessionStorage.
    if (bidangIlmuFromUrl) {
      setSelectedBidangIlmu(bidangIlmuFromUrl);
      try {
        sessionStorage.setItem(BIDANG_ILMU_STORAGE_KEY, bidangIlmuFromUrl);
      } catch {
        // ignore storage failures
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem(BIDANG_ILMU_STORAGE_KEY) ?? "";
      if (stored) setSelectedBidangIlmu(stored);
    } catch {
      // ignore storage failures
    }
  }, [bidangIlmuFromUrl]);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    router.push("/");
  };

  const handleBidangIlmuChange = (value: string) => {
    setSelectedBidangIlmu(value);

    try {
      if (value) sessionStorage.setItem(BIDANG_ILMU_STORAGE_KEY, value);
      else sessionStorage.removeItem(BIDANG_ILMU_STORAGE_KEY);
    } catch {
      // ignore storage failures
    }

    const qs = value ? `?bidang_ilmu=${encodeURIComponent(value)}` : "";
    router.push(`/calendar${qs}`);
    closeMenu();
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.log("[Navbar auth]", {
      loading: authLoading,
      isAuthenticated,
      user,
    });
  }, [authLoading, isAuthenticated, user]);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white py-3 lg:py-4 sticky top-0 z-50 border-b border-gray-200">
        <div className=" mx-auto w-full flex justify-between items-center px-20">
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
              className="text-[#4caf4f] text-xl lg:text-2xl font-bold truncate"
              onClick={closeMenu}
            >
              Eqariah
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Main Navigation Links */}
            <div className="flex items-center gap-8">
              {mainNavLinks.map(({ href, children }) => {
                const isActive =
                  href === "/"
                    ? pathname === "/"
                    : (pathname ?? "").startsWith(href);

                return (
                  <NavLink
                    key={href}
                    href={href}
                    className={`text-sm lg:text-base font-medium pb-1 border-b-2 transition-colors ${
                      isActive
                        ? "text-[#4caf4f] border-[#4caf4f]"
                        : "text-gray-600 border-transparent hover:text-[#4caf4f]"
                    }`}
                    onClick={closeMenu}
                  >
                    {children}
                  </NavLink>
                );
              })}

              {showBidangIlmuDropdown && (
                <div className="flex items-center">
                  <div className="relative">
                    <select
                      aria-label="Pilih Bidang Ilmu"
                      value={selectedBidangIlmu}
                      onChange={(e) => handleBidangIlmuChange(e.target.value)}
                      className="appearance-none text-sm lg:text-base bg-white px-4 py-2 rounded-full transition-colors border border-gray-200 text-gray-700 pr-10 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="" className="text-gray-900">
                        Bidang Ilmu...
                      </option>
                      {bidangIlmuOptions.map((opt) => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Section - Avatar Dropdown or Sign In */}
            {authLoading ? (
              // Show loading skeleton during auth initialization
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src="/bx-user.svg"
                      width={35}
                      height={35}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className={`transform transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink
                  href="/login"
                  className="text-sm lg:text-base font-medium text-[#4caf4f] hover:text-emerald-700"
                >
                  Sign In
                </NavLink>
                <Link
                  href="/register-mosque"
                  className="text-sm lg:text-base font-semibold bg-[#4caf4f] hover:bg-emerald-700 text-white px-5 py-2 rounded-full transition-colors"
                >
                  Daftar Masjid
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-700 focus:outline-none p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
        }`}
      >
        {/* Sidebar Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/eqariah.svg"
                width={28}
                height={28}
                alt="Eqariah logo"
                className="w-7 h-7"
              />
              <span className="text-xl font-bold text-[#4caf4f]">Eqariah</span>
            </div>
            <button
              onClick={closeMenu}
              className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            {mainNavLinks.map(({ href, children }) => (
              <NavLink
                key={href}
                href={href}
                onClick={closeMenu}
                className="block w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {children}
              </NavLink>
            ))}

            <Link
              href="/register-mosque"
              onClick={closeMenu}
              className="block w-full p-3 text-white bg-[#4caf4f] hover:bg-emerald-700 rounded-lg transition-colors font-semibold text-center"
            >
              Daftar Masjid
            </Link>

            {/* Bidang Ilmu Dropdown */}
            {showBidangIlmuDropdown && (
              <div className="mt-3">
                <label
                  htmlFor="navbar_bidang_ilmu"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                >
                  Bidang Ilmu
                </label>
                <div className="relative">
                  <select
                    id="navbar_bidang_ilmu"
                    value={selectedBidangIlmu}
                    onChange={(e) => handleBidangIlmuChange(e.target.value)}
                    className="appearance-none w-full p-3 pr-10 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Pilih Bidang Ilmu...</option>
                    {bidangIlmuOptions.map((opt) => (
                      <option key={opt.id} value={opt.name}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Auth Section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            {authLoading ? null : isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src="/bx-user.svg"
                      width={48}
                      height={48}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <NavLink
                  href="/profile"
                  onClick={closeMenu}
                  className="w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                href="/login"
                onClick={closeMenu}
                className="w-full p-3 text-[#4caf4f] hover:bg-green-50 rounded-lg transition-colors font-semibold flex items-center gap-3"
              >
                <Image
                  src="/bx-user.svg"
                  width={20}
                  height={20}
                  alt="User Icon"
                  className="w-5 h-5"
                />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
