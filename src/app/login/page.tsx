//login page
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/utils/api";
import { Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { handleError } from "@/lib/utils/errorHandler";
// import { User, FormState } from "../lib/types";

const Login = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toasts, closeToast, success, error } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setLoading(true);

    // Validation
    if (!formData.identifier || !formData.password) {
      error("Validation Error", "All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      error("Validation Error", "Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("api/auth/login", formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        success(
          "Login Successful!",
          "Welcome back! Redirecting to dashboard..."
        );
        setIsLoggedIn(true);

        // Delay redirect to show success message
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1000);
      } else {
        error(
          "Login Failed",
          response.data.message || "Invalid credentials. Please try again."
        );
      }
    } catch (err) {
      console.error("Login Error", err);
      const appError = handleError(err);
      error(
        appError.message,
        appError.description || "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show simple loading when redirecting after successful login
  if (isLoggedIn) {
    return null; // Or return null to avoid flash
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <Navbar />
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 flex flex-col md:flex-row lg:flex-row items-center">
          {/* Left Section */}
          <div className="flex-1 flex flex-col justify-center p-[6%] lg:p-38">
            <h1 className="text-green-600 text-[10vw] md:text-[7vw] lg:text-7xl font-bold animate-fade-in">
              Eqariah
            </h1>
            <p className="text-gray-700 text-[4vw] md:text-[3vw] lg:text-xl mt-4 animate-fade-in-delay">
              Eqariah helps you connect and share with all moslems in the world.
            </p>
          </div>
          {/* Right Section (Login Box) */}
          <div className="flex justify-center items-center flex-1 p-[6%] lg:p-38">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  Welcome Back
                </h2>
                <p className="text-gray-500 mt-2">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter Email or Username"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-300 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
              <p className="mt-6 text-center">
                <a
                  href="#"
                  className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
                  Forgotten password?
                </a>
              </p>
              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm mb-3">
                  Don&apos;t have an account?
                </p>
                <a
                  href="/register"
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-green-600 font-bold py-2.5 px-6 rounded-lg transition-all duration-200 border-2 border-green-600">
                  Create new account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
      `}</style>
    </>
  );
};

export default Login;
