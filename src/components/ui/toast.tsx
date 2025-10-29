"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  description,
  duration = 5000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const styles = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: "text-green-600",
      text: "text-green-900",
      description: "text-green-700",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-600",
      text: "text-red-900",
      description: "text-red-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-900",
      description: "text-blue-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      text: "text-yellow-900",
      description: "text-yellow-700",
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`
        ${currentStyle.container}
        border rounded-lg shadow-lg p-4 mb-3 w-full max-w-md
        transform transition-all duration-300 ease-in-out
        ${
          isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }
        hover:shadow-xl
      `}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${currentStyle.icon}`}>
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${currentStyle.text}`}>
            {message}
          </p>
          {description && (
            <p className={`text-xs mt-1 ${currentStyle.description}`}>
              {description}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ${currentStyle.icon} hover:opacity-70 transition-opacity`}
          aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            type === "success"
              ? "bg-green-500"
              : type === "error"
              ? "bg-red-500"
              : type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast Container
export const ToastContainer: React.FC<{
  toasts: Array<Omit<ToastProps, "onClose">>;
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto space-y-2 w-full max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};

// Hook for using toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, "onClose">>>([]);

  const showToast = (
    type: ToastType,
    message: string,
    description?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [
      ...prev,
      { id, type, message, description, duration },
    ]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    closeToast,
    success: (message: string, description?: string) =>
      showToast("success", message, description),
    error: (message: string, description?: string) =>
      showToast("error", message, description),
    info: (message: string, description?: string) =>
      showToast("info", message, description),
    warning: (message: string, description?: string) =>
      showToast("warning", message, description),
  };
};
