import { AxiosError } from "axios";

/**
 * Error types for better categorization
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * Structured error response
 */
export interface AppError {
  type: ErrorType;
  message: string;
  description?: string;
  statusCode?: number;
  originalError?: unknown;
}

/**
 * User-friendly error messages mapping
 */
const errorMessages: Record<
  ErrorType,
  { message: string; description: string }
> = {
  [ErrorType.NETWORK]: {
    message: "Network Error",
    description: "Please check your internet connection and try again.",
  },
  [ErrorType.AUTHENTICATION]: {
    message: "Authentication Failed",
    description:
      "Invalid credentials. Please check your email/username and password.",
  },
  [ErrorType.AUTHORIZATION]: {
    message: "Access Denied",
    description: "You don't have permission to access this resource.",
  },
  [ErrorType.VALIDATION]: {
    message: "Validation Error",
    description: "Please check your input and try again.",
  },
  [ErrorType.NOT_FOUND]: {
    message: "Not Found",
    description: "The requested resource could not be found.",
  },
  [ErrorType.SERVER]: {
    message: "Server Error",
    description: "Something went wrong on our end. Please try again later.",
  },
  [ErrorType.UNKNOWN]: {
    message: "Unexpected Error",
    description: "An unexpected error occurred. Please try again.",
  },
};

/**
 * Determine error type from status code
 */
const getErrorTypeFromStatus = (status?: number): ErrorType => {
  if (!status) return ErrorType.UNKNOWN;

  if (status === 401) return ErrorType.AUTHENTICATION;
  if (status === 403) return ErrorType.AUTHORIZATION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status >= 400 && status < 500) return ErrorType.VALIDATION;
  if (status >= 500) return ErrorType.SERVER;

  return ErrorType.UNKNOWN;
};

/**
 * Extract error message from various error formats
 */
const extractErrorMessage = (error: unknown): string => {
  // Axios error
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "An error occurred"
    );
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
};

/**
 * Main error handler function
 * Converts any error into a structured AppError
 */
export const handleError = (error: unknown): AppError => {
  console.error("Error occurred:", error);

  // Handle network errors
  if (error && typeof error === "object" && "message" in error) {
    const err = error as Error;
    if (err.message === "Network Error" || err.message.includes("network")) {
      return {
        type: ErrorType.NETWORK,
        message: errorMessages[ErrorType.NETWORK].message,
        description: errorMessages[ErrorType.NETWORK].description,
        originalError: error,
      };
    }
  }

  // Handle Axios errors
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    }>;

    const status = axiosError.response?.status;
    const errorType = getErrorTypeFromStatus(status);
    const baseError = errorMessages[errorType];

    // Extract custom message from response
    const customMessage = extractErrorMessage(error);

    // Handle validation errors with field details
    if (
      errorType === ErrorType.VALIDATION &&
      axiosError.response?.data?.errors
    ) {
      const errors = axiosError.response.data.errors;
      const fieldErrors = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("; ");

      return {
        type: errorType,
        message: baseError.message,
        description: fieldErrors || customMessage,
        statusCode: status,
        originalError: error,
      };
    }

    return {
      type: errorType,
      message: customMessage || baseError.message,
      description: baseError.description,
      statusCode: status,
      originalError: error,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      description: errorMessages[ErrorType.UNKNOWN].description,
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      description: errorMessages[ErrorType.UNKNOWN].description,
      originalError: error,
    };
  }

  // Fallback for unknown error types
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessages[ErrorType.UNKNOWN].message,
    description: errorMessages[ErrorType.UNKNOWN].description,
    originalError: error,
  };
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error: AppError): string => {
  if (error.description) {
    return `${error.message}: ${error.description}`;
  }
  return error.message;
};

/**
 * Check if error requires user logout
 */
export const shouldLogout = (error: AppError): boolean => {
  return error.type === ErrorType.AUTHENTICATION && error.statusCode === 401;
};

/**
 * Quick error handler for async operations
 * Usage: await handleAsync(someAsyncFunction())
 */
export const handleAsync = async <T>(
  promise: Promise<T>
): Promise<[AppError | null, T | null]> => {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [handleError(error), null];
  }
};
