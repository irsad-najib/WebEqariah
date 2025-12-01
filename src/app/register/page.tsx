"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

// Import new types and utilities
import { useForm } from "@/lib/hooks/useForm";
import { VALIDATION_MESSAGES } from "@/lib/constants";
import { axiosInstance } from "@/lib/utils/api";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Loading } from "@/components/ui/Loading";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RegisterFormData } from "@/lib/types";

// Form data type

const Register = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Validation rules
  const validationRules = {
    username: (value: string) => {
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      return null;
    },
    email: (value: string) => {
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return VALIDATION_MESSAGES.EMAIL_INVALID;
      return null;
    },
    password: (value: string) => {
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      if (value.length < 6) return "Password must be at least 6 characters";
      return null;
    },
    confirmPassword: (value: string) => {
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      if (value !== values.password)
        return VALIDATION_MESSAGES.PASSWORD_MISMATCH;
      return null;
    },
  };

  // Use form hook
  const { values, errors, formState, setValue, handleSubmit } =
    useForm<RegisterFormData>(
      {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      validationRules
    );

  const onSubmit = async (formData: RegisterFormData) => {
    const dataToSend = {
      ...formData,
    };

    const response = await axiosInstance.post("/api/auth/register", dataToSend);

    if (response.data.success) {
      router.replace("/registration-success");
    } else {
      throw new Error(response.data.message || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50 relative overflow-hidden">
        {/* Islamic Pattern Background */}
        <div
          className="fixed inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="flex-1 flex flex-col md:flex-row items-center relative z-10">
          {/* Left Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Create Account
                </h1>
                <p className="text-gray-600">Join our community today</p>
              </div>

              {formState.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {typeof formState.error === "string"
                    ? formState.error
                    : formState.error
                    ? Object.values(formState.error).join(", ")
                    : null}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit);
                }}>
                <Input
                  label="Username"
                  type="text"
                  value={values.username}
                  onChange={(e) => setValue("username", e.target.value)}
                  error={errors.username}
                  placeholder="Enter your username"
                />

                <Input
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={(e) => setValue("email", e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email"
                />

                <div className="relative mb-4">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={(e) => setValue("password", e.target.value)}
                    error={errors.password}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-8 text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative mb-4">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onChange={(e) =>
                      setValue("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-8 text-gray-500">
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  loading={formState.loading}
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  Create Account
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden">
            {/* Decorative Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="h-full flex items-center justify-center text-white relative z-10 p-8">
              <div className="text-center max-w-md">
                <div className="mb-8">
                  <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm mb-6">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
                  Welcome
                </h2>
                <p className="text-2xl mb-4 text-green-50">
                  Start your journey with us
                </p>
                <p className="text-lg text-green-100">
                  Connect with your mosque community and stay updated with the
                  latest announcements and events
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
