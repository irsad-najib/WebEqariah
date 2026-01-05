"use client";
import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { axiosInstance } from "@/lib/utils/api";
import { Camera, User as UserIcon } from "lucide-react";
import Image from "next/image";

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onSuccess: (data: {
    username: string;
    email: string;
    avatar_url?: string;
  }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    username: userData.username,
    email: userData.email,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    preview,
    file,
    error: imageError,
    handleFileSelect,
    resetImage,
    setPreview,
  } = useImageUpload({
    maxSizeMB: 5,
    initialPreview: userData.avatar_url || null,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: userData.username,
        email: userData.email,
      });
      setPreview(userData.avatar_url || null);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, userData, setPreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload image if there's a new file
      let avatarUrl = userData.avatar_url;

      if (file) {
        const formDataImage = new FormData();
        formDataImage.append("image", file);

        const uploadResponse = await axiosInstance.post(
          "/api/upload/image",
          formDataImage,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.data.success) {
          avatarUrl = uploadResponse.data.data.image_url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Update user profile
      const updateData = {
        username: formData.username,
        email: formData.email,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      };

      const response = await axiosInstance.put(
        `/api/users/${userData.id}`,
        updateData
      );

      if (response.data.success) {
        setSuccess(true);
        onSuccess({
          username: formData.username,
          email: formData.email,
          ...(avatarUrl && { avatar_url: avatarUrl }),
        });

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(response.data.error || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetImage();
    setFormData({
      username: userData.username,
      email: userData.email,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Profile"
      size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={handleImageClick}
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer hover:border-green-500 transition-all group">
            {preview ? (
              <Image
                src={preview}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <UserIcon size={48} className="text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
              <Camera
                size={32}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
          {imageError && (
            <p className="text-sm text-red-500 mt-1">{imageError}</p>
          )}
        </div>

        {/* Form Fields */}
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          placeholder="Enter your username"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="Enter your email"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Profile updated successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={loading || !!imageError}
            loading={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
