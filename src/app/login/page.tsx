//login page
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/utils/api";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
// import { User, FormState } from "../lib/types";

const Login = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };
  //check auth status
  useEffect(() => {
    const chekLoggedIn = async () => {
      try {
        const authRes = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });

        if (authRes.data.role === "user") {
          setIsLoggedIn(true);
          router.replace("/");
        } else {
          setIsLoggedIn(true);
          router.replace("/dashboard");
        }
      } catch (er) {
        console.log("session verification failed", er);
        setIsLoggedIn(false);
      }
    };
    chekLoggedIn();
  }, [router]);
  //handler for login submit button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.identifier || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("api/auth/login", formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        setIsLoggedIn(true);
        router.replace("/dashboard");
      } else {
        setError("login Failed :" + (response.data.message || "unknown error"));
      }
    } catch (err) {
      console.error("Login Error", err);

      let errorMessage = "Unknown error";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        errorMessage = (err as { response: { data: { message: string } } })
          .response.data.message;
      }

      setError("Login Failed: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };
  if (isLoggedIn) {
    return <p>Redirecting...</p>;
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-gray-100">
        <div className="flex-1 flex flex-col md:flex-row lg:flex-row items-center">
          {/* Left Section */}
          <div className="flex-1 flex flex-col justify-center p-[6%] lg:p-38">
            <h1 className="text-green-600 text-[10vw] md:text-[7vw] lg:text-7xl font-bold">
              Eqariah
            </h1>
            <p className="text-gray-700 text-[4vw] md:text-[3vw] lg:text-xl mt-4">
              Eqariah helps you connect and share with all moslems in the world.
            </p>
          </div>
          {/* Right Section (Login Box) */}
          <div className="flex justify-center items-center flex-1 p-[6%] lg:p-38">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
                Log in
              </h2>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Email or Username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Log in"}
                </button>
              </form>
              <p className="mt-6 text-center">
                <a
                  href="#"
                  className="text-green-500 hover:text-green-700 text-sm"
                >
                  Forgotten password?
                </a>
              </p>
              <div className="text-center mt-6">
                <a
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create new account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
