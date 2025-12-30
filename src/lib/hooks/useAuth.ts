"use client";
import { useState, useEffect, useCallback } from "react";
import { AuthState, User } from "../types";
import { authCookies } from "../utils/cookies";
import { axiosInstance } from "@/lib/utils/api";

/**
 * Custom hook untuk authentication
 * Ngurus login, logout, cek status login, dll
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  // Initialize auth state dari cookies saat pertama load
  useEffect(() => {
    const initAuth = () => {
      try {
        const { token, user } = authCookies.getAuthData();

        if (token && user) {
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        authCookies.clearAuthData();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Function untuk login
  const login = useCallback(async (identifier: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      // Call API login (lo bisa ganti URL sesuai backend lo)
      const Response = await axiosInstance.post("/api/auth/login", {
        identifier,
        password,
      });

      const data = Response.data;

      if (Response.status === 200 && data.success) {
        const { user, token } = data.data;

        // Simpan ke cookies
        authCookies.setAuthData(token, user);

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });

        return { success: true };
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
        return {
          success: false,
          error: data.message || "Login failed",
        };
      }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }, []);

  // Function untuk logout
  const logout = useCallback(async () => {
    try {
      // Call API logout (optional)
      await axiosInstance.get("/api/auth/logout", {
        withCredentials: true,
        headers: authState.token
          ? {
              Authorization: `Bearer ${authState.token}`,
            }
          : undefined,
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear cookies dan state
      authCookies.clearAuthData();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, [authState.token]);

  // Function untuk update user data
  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };

      // Update cookies juga
      authCookies.setAuthData(prev.token!, updatedUser);

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  return {
    // Auth state
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,

    // Auth functions
    login,
    logout,
    updateUser,
  };
};
