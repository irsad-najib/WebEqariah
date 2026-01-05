import { useState, useCallback } from "react";

interface UseImageUploadReturn {
  preview: string | null;
  file: File | null;
  isValid: boolean;
  error: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
  setPreview: (url: string | null) => void;
}

interface UseImageUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  initialPreview?: string | null;
}

export const useImageUpload = (
  options: UseImageUploadOptions = {}
): UseImageUploadReturn => {
  const {
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    initialPreview = null,
  } = options;

  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      // Validate file type
      if (!allowedTypes.includes(selectedFile.type)) {
        setError(
          `Invalid file type. Allowed: ${allowedTypes
            .map((t) => t.split("/")[1])
            .join(", ")}`
        );
        setFile(null);
        setPreview(null);
        return;
      }

      // Validate file size
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        setFile(null);
        setPreview(null);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      setFile(selectedFile);
      setError(null);
    },
    [allowedTypes, maxSizeMB]
  );

  const resetImage = useCallback(() => {
    setPreview(initialPreview);
    setFile(null);
    setError(null);
  }, [initialPreview]);

  return {
    preview,
    file,
    isValid: file !== null && error === null,
    error,
    handleFileSelect,
    resetImage,
    setPreview,
  };
};
