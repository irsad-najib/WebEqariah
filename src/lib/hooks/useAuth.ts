"use client";

import { useAuthContext } from "@/lib/providers/AuthProvider";

/**
 * Custom hook untuk authentication
 * Shared globally via AuthProvider (single source of truth).
 */
export const useAuth = () => {
  return useAuthContext();
};
