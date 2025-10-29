"use client";
import { useState, useEffect, useCallback } from "react";
import { ApiResponse } from "../types";
import { authCookies } from "../utils/cookies";

/**
 * Custom hook untuk API calls
 * Ngurus loading state, error handling, auto retry, dll
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useApi = <T = any>(
  url?: string,
  options?: RequestInit,
  autoFetch = false
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function untuk make API call
  const fetchData = useCallback(
    async (
      customUrl?: string,
      customOptions?: RequestInit
    ): Promise<ApiResponse<T>> => {
      const finalUrl = customUrl || url;

      if (!finalUrl) {
        const errorResponse = {
          success: false,
          message: "No URL provided",
          error: "No URL provided",
        };
        setError(errorResponse.message);
        return errorResponse;
      }

      setLoading(true);
      setError(null);

      try {
        const { token } = authCookies.getAuthData();

        const config: RequestInit = {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          ...options,
          ...customOptions,
        };

        const response = await fetch(finalUrl, config);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        setData(result);
        setLoading(false);

        return {
          success: true,
          message: "Request successful",
          data: result,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setLoading(false);

        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      }
    },
    [url, options]
  );

  // Auto fetch saat component mount kalau autoFetch = true
  useEffect(() => {
    if (autoFetch && url) {
      fetchData();
    }
  }, [autoFetch, url, fetchData]);

  // Function untuk refetch
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
  };
};
