"use client";
import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { axiosInstance } from "@/lib/utils/api";
import { Camera, Building2 } from "lucide-react";
import Image from "next/image";

interface MosqueData {
  id: number;
  mosque_name: string;
  contact_person: string;
  contact_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  image_url?: string;
  status: string;
}

interface EditMosqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueData: MosqueData;
  onSuccess: (data: MosqueData) => void;
}

export const EditMosqueModal: React.FC<EditMosqueModalProps> = ({
  isOpen,
  onClose,
  mosqueData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    mosque_name: mosqueData.mosque_name,
    contact_person: mosqueData.contact_person,
    contact_phone: mosqueData.contact_phone,
    address_line1: mosqueData.address_line1,
    address_line2: mosqueData.address_line2 || "",
    city: mosqueData.city,
    state: mosqueData.state,
    postal_code: mosqueData.postal_code,
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
    maxSizeMB: 10,
    initialPreview: mosqueData.image_url || null,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        mosque_name: mosqueData.mosque_name,
        contact_person: mosqueData.contact_person,
        contact_phone: mosqueData.contact_phone,
        address_line1: mosqueData.address_line1,
        address_line2: mosqueData.address_line2 || "",
        city: mosqueData.city,
        state: mosqueData.state,
        postal_code: mosqueData.postal_code,
      });
      setPreview(mosqueData.image_url || null);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, mosqueData, setPreview]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      let imageUrl = mosqueData.image_url;

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
          imageUrl = uploadResponse.data.data.image_url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Update mosque data
      const updateData = {
        ...formData,
        ...(imageUrl && { image_url: imageUrl }),
      };

      const response = await axiosInstance.put(
        `/api/mosques/${mosqueData.id}`,
        updateData
      );

      if (response.data.success) {
        setSuccess(true);
        onSuccess({
          ...mosqueData,
          ...updateData,
          ...(imageUrl && { image_url: imageUrl }),
        });

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(response.data.error || "Failed to update mosque");
      }
    } catch (err: any) {
      console.error("Error updating mosque:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to update mosque"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetImage();
    setFormData({
      mosque_name: mosqueData.mosque_name,
      contact_person: mosqueData.contact_person,
      contact_phone: mosqueData.contact_phone,
      address_line1: mosqueData.address_line1,
      address_line2: mosqueData.address_line2 || "",
      city: mosqueData.city,
      state: mosqueData.state,
      postal_code: mosqueData.postal_code,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Edit Mosque" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mosque Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={handleImageClick}
            className="relative w-full h-48 rounded-lg overflow-hidden border-4 border-gray-200 cursor-pointer hover:border-green-500 transition-all group">
            {preview ? (
              <Image src={preview} alt="Mosque" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Building2 size={64} className="text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
              <Camera
                size={40}
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
          <p className="text-sm text-gray-500 mt-2">
            Klik untuk menukar foto masjid
          </p>
          {imageError && (
            <p className="text-sm text-red-500 mt-1">{imageError}</p>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Mosque Name"
              name="mosque_name"
              value={formData.mosque_name}
              onChange={handleInputChange}
              required
              placeholder="Masukkan Nama Masjid"
            />
          </div>

          <Input
            label="Contact Person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleInputChange}
            required
            placeholder="Masukkan nama kontak"
          />

          <Input
            label="Contact Phone"
            name="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={handleInputChange}
            required
            placeholder="Masukkan nomor talifon kontak"
          />

          <div className="md:col-span-2">
            <Input
              label="Address Line 1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              required
              placeholder="Masukkan alamat"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Address Line 2 (Optional)"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              placeholder="Masukkan alamat baris 2"
            />
          </div>

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            placeholder="Masukkan nama bandar"
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            placeholder="Masukkan nama negeri"
          />

          <div className="md:col-span-2">
            <Input
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              required
              placeholder="Masukkan kod pos"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Mosque updated successfully!
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
