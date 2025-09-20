"use client";
import { Navbar } from "@/components/layout/Navbar";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Upload } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";

interface CustomAlertProps {
  children: React.ReactNode;
  variant?: "error" | "success";
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  children,
  variant = "error",
}) => (
  <div
    className={`px-[3%] lg:px-3 py-[3%] lg:py-3 rounded mb-[3%] lg:mb-3 ${
      variant === "error"
        ? "bg-red-100 text-red-700 border border-red-400"
        : "bg-green-100 text-green-700"
    }`}
  >
    {children}
  </div>
);

interface FormDataType {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  mosqueName: string;
  contactPhone: string;
  contactPerson: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  imageUrl: string;
}

interface ErrorType {
  [key: string]: string;
}

const RegisterMosque = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorType>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(
    false
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mosqueName: "",
    contactPhone: "",
    contactPerson: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    imageUrl: "",
  });

  const validateForm = (): ErrorType => {
    const newErrors: ErrorType = {};
    const phoneRegex = /^[0-9]{10,13}$/;
    const postalRegex = /^[0-9]{5}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username?.trim()) newErrors.username = "Username is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password?.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword?.trim())
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.imageUrl) newErrors.imageUrl = "Mosque image is required";
    if (!formData.mosqueName?.trim())
      newErrors.mosqueName = "Mosque name is required";
    if (!formData.addressLine1?.trim())
      newErrors.addressLine1 = "Address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";

    if (!formData.contactPhone?.trim())
      newErrors.contactPhone = "Phone number is required";
    else if (!phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone =
        "Please enter a valid phone number (10-13 digits)";
    }

    if (!formData.postalCode?.trim())
      newErrors.postalCode = "Postal code is required";
    else if (!postalRegex.test(formData.postalCode)) {
      newErrors.postalCode = "Please enter a valid 5-digit postal code";
    }

    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = "Administrator name is required";
    }

    return newErrors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append("image", file);
    setUploading(true);

    try {
      const response = await axiosInstance.post(
        "/api/mosque/upload-image",
        formDataImage,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: response.data.url,
        }));
        setErrors((prev) => ({ ...prev, imageUrl: "" }));
        setIsOpen(false);
        setPreview(null);
        setFile(null);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error uploading image";
      setErrors((prev) => ({
        ...prev,
        imageUrl: errorMessage,
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (uploading) {
      alert("Please wait for image upload to complete");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/api/mosque/register-mosque",
        formData
      );
      if (response.status === 200) {
        alert("Registration Mosque was succesfull");
        router.push("/registration-success");
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (error) {
      const err = error as Error;
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Error during registration",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-200 flex items-center justify-center min-h-screen pt-10 pb-10">
        <div className="bg-gray-50 p-12 pt-10 rounded-lg shadow-lg w-full md:w-[70%] lg:w-[538px]">
          <h1 className="text-[6vw] font-bold text-center text-green-600 mb-[4%] md:text-[3vw] lg:text-2xl">
            Register Mosque
          </h1>

          {errors.submit && (
            <CustomAlert variant="error">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.submit}</span>
            </CustomAlert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white flex p-12 rounded-lg shadow-lg w-full">
              {/* Mosque Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                    Mosque Name
                  </label>
                  <input
                    type="text"
                    name="mosqueName"
                    value={formData.mosqueName}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                      errors.mosqueName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter Mosque Name"
                  />
                  {errors.mosqueName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.mosqueName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                      errors.contactPerson
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter the Name of the Mosque Administrator"
                  />
                  {errors.contactPerson && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactPerson}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                      errors.contactPhone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter Number Phone of Mosque Administrator"
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactPhone}
                    </p>
                  )}
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                        errors.addressLine1
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Street Name"
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                          errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                          errors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Select Mosque Image
                </button>

                {isOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-black bg-opacity-50"
                      onClick={() => setIsOpen(false)}
                    />

                    <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Upload Mosque Image
                        </h3>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-sm text-gray-500">
                        Select and preview your image before uploading
                      </p>
                      <p className="text-sm text-gray-500">
                        Maks size image 5 mb
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        format file: png, jpg, jpeg, heic, and heif
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            id="mosque-image-modal"
                          />
                          <label
                            htmlFor="mosque-image-modal"
                            className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline cursor-pointer"
                          >
                            <Upload className="h-6 w-6 mb-2" />
                            Choose Image
                          </label>
                        </div>

                        {errors?.imageUrl && (
                          <p className="text-red-500 text-sm text-center">
                            {errors.imageUrl}
                          </p>
                        )}

                        {preview && (
                          <div className="space-y-4">
                            <div className="relative w-full h-96">
                              <Image
                                src={preview}
                                alt="Preview"
                                className="rounded-md object-cover"
                                fill
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreview(null);
                                  setFile(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                              >
                                {uploading ? "Uploading..." : "Upload"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white flex p-12 rounded-lg shadow-lg w-full">
              <div className="space-y-5">
                <p className="text-black font-bold text-xl text-center">
                  Register an Acount to Login into Mosque Admin Dashboard
                </p>
                <div>
                  <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter an Username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter Email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-gray-700 text-[3.5vw] md:text-[2.5vw] lg:text-base font-bold mb-[1%] lg:mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter Pashword"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
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
                      onChange={handleChange}
                      className={`shadow appearance-none border rounded w-full py-[2%] lg:py-2 px-[3%] lg:px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter confirm Pashword"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterMosque;
