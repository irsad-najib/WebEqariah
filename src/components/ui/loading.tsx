import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  variant?: "spinner" | "dots" | "pulse";
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  variant = "spinner",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const renderSpinner = () => (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-4 border-gray-200 border-t-green-600 ${sizeClasses[size]}`}
      />
      {text && (
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  const renderDots = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-2">
        <div
          className={`${sizeClasses[size]} bg-green-600 rounded-full animate-bounce`}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={`${sizeClasses[size]} bg-green-600 rounded-full animate-bounce`}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={`${sizeClasses[size]} bg-green-600 rounded-full animate-bounce`}
          style={{ animationDelay: "300ms" }}
        />
      </div>
      {text && (
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  const renderPulse = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} bg-green-600 rounded-full animate-ping absolute`}
        />
        <div
          className={`${sizeClasses[size]} bg-green-600 rounded-full relative`}
        />
      </div>
      {text && (
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  const content = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {content()}
      </div>
    );
  }

  return content();
};

// Skeleton loader for content loading states
interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  count = 1,
  height = "h-4",
  width = "w-full",
  circle = false,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`
            ${circle ? "rounded-full" : "rounded"}
            ${height}
            ${width}
            bg-gray-200
            animate-pulse
            ${className}
          `}
        />
      ))}
    </>
  );
};

// Card skeleton for loading cards
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <Skeleton circle width="w-12" height="h-12" className="mr-3" />
            <div className="flex-1 space-y-2">
              <Skeleton width="w-1/2" height="h-4" />
              <Skeleton width="w-1/3" height="h-3" />
            </div>
          </div>
          <Skeleton count={3} className="mb-2" />
          <div className="mt-4 flex gap-2">
            <Skeleton width="w-20" height="h-8" />
            <Skeleton width="w-20" height="h-8" />
          </div>
        </div>
      ))}
    </>
  );
};

// Table skeleton for loading tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} width="flex-1" height="h-4" />
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b border-gray-100">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} width="flex-1" height="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline loader for button loading states
export const ButtonLoader: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <svg
      className={`animate-spin h-5 w-5 text-white ${className}`}
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
  );
};
