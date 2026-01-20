"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { fetchBidangIlmu, type BidangIlmu } from "@/lib/api/bidangIlmu";
import { useAuth } from "@/lib/hooks/useAuth";

const BIDANG_ILMU_STORAGE_KEY = "eqariah_bidang_ilmu";

// ... (keep interface and other components)

const NavbarInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hideBidangIlmuDropdown = (pathname ?? "").startsWith("/calendar");
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

  // ... (keep handleLogout and handleBidangIlmuChange)

  // ... (inside desktop render)
              {/* Bidang Ilmu Dropdown */}
              {!hideBidangIlmuDropdown && (
                <div className="flex items-center">
                  <select
                    aria-label="Pilih Bidang Ilmu"
                    value={selectedBidangIlmu}
                    onChange={(e) => handleBidangIlmuChange(e.target.value)}
                    className="text-white text-lg bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all border border-white/20">
                    <option value="" className="text-gray-900">
                      Bidang Ilmu...
                    </option>
                    {bidangIlmuOptions.map((opt) => (
                      <option key={opt.id} value={opt.name} className="text-gray-900">
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

  // ... (inside mobile render)
            {/* Bidang Ilmu Dropdown */}
            {!hideBidangIlmuDropdown && (
              <div className="mt-3">
                <label
                  htmlFor="navbar_bidang_ilmu"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Bidang Ilmu
                </label>
                <select
                  id="navbar_bidang_ilmu"
                  value={selectedBidangIlmu}
                  onChange={(e) => handleBidangIlmuChange(e.target.value)}
                  className="w-full p-3 text-gray-700 bg-white border border-gray-200 rounded-lg">
                  <option value="">Pilih Bidang Ilmu...</option>
                  {bidangIlmuOptions.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}


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
    href: "/dashboard",
    children: "Dashboard",
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
    href: "/ustadz",
    children: "Ustadz",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4 20h16a2 2 0 002-2v-2a3 3 0 00-3-3H5a3 3 0 00-3 3v2a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: "/kitab",
    children: "Kitab",
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
    href: "/instructions",
    children: "Cara Penggunaan",
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
    href: "/register-mosque",
    children: "Register Masjid",
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
];

export const Navbar = () => {
  return (
    <Suspense fallback={<div className="h-14 bg-[#4caf4f]" />}>
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
  const hideBidangIlmuDropdown = (pathname ?? "").startsWith("/calendar");
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const bidangIlmuFromUrl = searchParams.get("bidang_ilmu") ?? "";
  const [selectedBidangIlmu, setSelectedBidangIlmu] = useState<string>("");

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

              {/* Bidang Ilmu Dropdown */}
              {!hideBidangIlmuDropdown && (
                <div className="flex items-center">
                  <select
                    aria-label="Pilih Bidang Ilmu"
                    value={selectedBidangIlmu}
                    onChange={(e) => handleBidangIlmuChange(e.target.value)}
                    className="text-white text-lg bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all border border-white/20">
                    <option value="" className="text-gray-900">
                      Bidang Ilmu...
                    </option>
                    {BIDANG_ILMU_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="text-gray-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Auth Section - Avatar Dropdown or Sign In */}
            {authLoading ? (
              // Show loading skeleton during auth initialization
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white/30">
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
                    }`}>
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
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors">
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
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

            {/* Bidang Ilmu Dropdown */}
            {!hideBidangIlmuDropdown && (
              <div className="mt-3">
                <label
                  htmlFor="navbar_bidang_ilmu"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Bidang Ilmu
                </label>
                <select
                  id="navbar_bidang_ilmu"
                  value={selectedBidangIlmu}
                  onChange={(e) => handleBidangIlmuChange(e.target.value)}
                  className="w-full p-3 text-gray-700 bg-white border border-gray-200 rounded-lg">
                  <option value="">Pilih Bidang Ilmu...</option>
                  {BIDANG_ILMU_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }>
                  Profile
                </NavLink>
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
              </>
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
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
