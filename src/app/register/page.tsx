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
      router.replace("/");
    } else {
      throw new Error(response.data.message || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-gray-100">
        <div className="flex-1 flex flex-col md:flex-row items-center">
          {/* Left Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-green-600 mb-2">
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
                  className="w-full">
                  Create Account
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-green-600 hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:block w-1/2 bg-green-500">
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">Welcome</h2>
                <p className="text-xl">Start your journey with us</p>
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
