import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "./API";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className = "" }: NavLinkProps) => (
  <Link
    href={href}
    className={`hover:text-gray-200 transition-colors duration-200 ${className}`}
  >
    {children}
  </Link>
);

const navLinks = [
  { href: "/", children: "Home" },
  { href: "/about", children: "About" },
  { href: "/contact", children: "Contact" },
  { href: "/profile", children: "Profile" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authsession = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        console.log(auth.data);
        if (auth.data.Authenticated === true) {
          setIsLogin(true);
        }
      } catch (errr) {
        console.log(errr);
      }
    };
    authsession();

    // Define checkLoginStatus function
    const checkLoginStatus = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        setIsLogin(auth.data.Authenticated === true);
      } catch (error) {
        console.log(error);
      }
    };

    const intervalId = setInterval(checkLoginStatus, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("api/auth/logout", {
        withCredentials: true,
      });
      setIsLogin(false);
      router.replace("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="bg-[#4caf4f] py-[3%] lg:py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-[4%]">
        <div className="flex items-center">
          <Image
            src="/eqariah.svg"
            width={20}
            height={20}
            alt="Eqariah logo"
            className="w-[30px] h-[30px] object-contain scale-150"
            priority
          />
          <NavLink
            href="/"
            className="ml-[10%] text-white text-[4vw] md:text-[4.8vw] lg:text-2xl font-bold"
          >
            Eqariah
          </NavLink>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 md:h-8 md:w-8"
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

        <div className="hidden lg:flex items-center space-x-8">
          <div className="flex space-x-6">
            {navLinks.map(({ href, children }) => (
              <NavLink key={href} href={href} className="text-white text-lg">
                {children}
              </NavLink>
            ))}
          </div>

          {isLogin ? (
            <div
              className="text-xl font-medium text-white cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-white">
              <Image
                src="/bx-user.svg"
                width={32}
                height={32}
                alt="User Icon"
                className="w-8 h-8"
              />
              <NavLink href="/login" className="text-xl font-medium">
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <div
        className={`lg:hidden absolute w-full bg-[#4caf4f] transition-all duration-500 ease-in-out 
                ${
                  isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                } shadow-lg`}
      >
        <div className="px-[4%] py-[4%] space-y-[3%]">
          {navLinks.map(({ href, children }) => (
            <NavLink
              key={href}
              href={href}
              className="block text-white text-[3vw]"
            >
              {children}
            </NavLink>
          ))}

          {isLogin ? (
            <div
              className="text-white text-[3.3vw] font-medium cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </div>
          ) : (
            <div className="flex items-center space-x-[2%] pt-[5%] border-t border-white/20">
              <Image
                src="/bx-user.svg"
                width={32}
                height={32}
                alt="User Icon"
                className="w-6 h-6"
              />
              <NavLink
                href="/login"
                className="text-white text-[3.3vw] font-medium"
              >
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
