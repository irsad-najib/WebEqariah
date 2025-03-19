"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../component/API";

// Basic types
type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Mosque = {
  id: number;
  mosqueName: string;
  contactPerson: string;
  contactPhone: string;
  imageUrl: string;
};

const Register = () => {
  const router = useRouter();

  // State management
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [filteredMosques, setFilteredMosques] = useState<Mosque[]>([]);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMosques = async () => {
      try {
        const response = await axiosInstance.get("api/mosque");
        console.log(response.data);
        if (Array.isArray(response.data)) {
          setMosques(response.data);
        } else if (response.data.success && Array.isArray(response.data.data)) {
          // Alternative format handling if needed
          setMosques(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching mosque:", error);
        setError("Failed to fetch mosques. Please try again.");
      }
    };
    fetchMosques();
  }, []);

  useEffect(() => {
    // When search query changes, filter the mosques
    if (!searchQuery.trim()) {
      setFilteredMosques(mosques.slice(0, 5)); // Show first 5 mosques when no search query
    } else {
      const filtered = mosques.filter((mosque) =>
        mosque.mosqueName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMosques(filtered);
    }
  }, [searchQuery, mosques]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        affiliateMosqueID: selectedMosque?.id,
      };

      const response = await axiosInstance.post(
        "api/auth/register",
        dataToSend,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row lg:flex-row items-center bg-gray-200">
      {/* Left Section */}
      <div className="bg-gray-200 md:w-[65%] lg:min-h-screen flex justify-center items-center lg:items-end flex-col pt-10 pb-10">
        <div className="items-center">
          <h1 className="text-[10vw] font-bold text-center text-green-600 mb-[3%] md:text-[5vw] lg:text-4xl">
            Eqariah
          </h1>
          <div className="pt-10 bg-white p-12 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-[6vw] text-gray-700 font-bold mb-[4%] text-center md:text-[3vw] lg:text-2xl">
              Register
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-[3%] lg:px-3 py-[3%] lg:py-3 rounded mb-[3%] lg:mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                  Select Mosque
                </label>
                <Combobox value={selectedMosque} onChange={setSelectedMosque}>
                  <div className="relative">
                    <ComboboxInput
                      className="shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Search mosque"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      displayValue={(mosque: Mosque | null) =>
                        mosque ? mosque.mosqueName : ""
                      }
                    />
                    {(filteredMosques.length > 0 || searchQuery) && (
                      <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredMosques.length > 0 ? (
                          filteredMosques.map((mosque) => (
                            <ComboboxOption
                              key={mosque.id}
                              value={mosque}
                              className="cursor-pointer relative select-none py-2 pl-3 pr-9 text-gray-900"
                            >
                              {mosque.mosqueName}
                            </ComboboxOption>
                          ))
                        ) : (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            No mosques found.
                          </div>
                        )}
                      </ComboboxOptions>
                    )}
                  </div>
                </Combobox>
              </div>

              <div className="text-gray-600 text-xs mt-4">
                <p>
                  People who use our service may have uploaded your contact
                  information to Eqariah.{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Learn more.
                  </a>
                </p>
                <p className="mt-2">
                  By clicking Sign Up, you agree to our{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Terms
                  </a>
                  ,{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Cookies Policy
                  </a>
                  .
                </p>
                <p className="mt-1">You may receive Email from us.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
              >
                {loading ? "Loading..." : "Sign Up"}
              </button>
            </form>

            <p className="text-gray-700 mt-[6%] text-center text-[3vw] md:text-[2vw] lg:text-lg lg:mt-6">
              Already have an account?{" "}
              <Link href="/" className="text-blue-500 hover:text-blue-700">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="h-[740px] md:w-[35%]">
        <div className="lg:ml-10 flex flex-cols">
          <div className="pt-10 bg-white p-12 rounded-lg shadow-lg max-w-md">
            <h1 className="text-[6vw] text-gray-700 font-bold mb-[4%] text-center md:text-[3vw] lg:text-2xl">
              Want to register your mosque?
            </h1>
            <Link
              href="/register-mosque"
              className="flex bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 items-center justify-center "
            >
              Register Mosque
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
