"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthState, User } from "@/lib/types";
import { authCookies } from "@/lib/utils/cookies";
import { axiosInstance } from "@/lib/utils/api";

type LoginResult = { success: true } | { success: false; error: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const extractVerify = (
  payload: any
): { isAuthenticated: boolean; user: User | null } => {
  if (payload?.Authenticated === true) {
    return {
      isAuthenticated: true,
      user: (payload.user ?? null) as User | null,
    };
  }

  // Some endpoints may wrap in { success, data }
  if (payload?.success === true && payload?.data) {
    const data = payload.data;
    if (data?.Authenticated === true) {
      return {
        isAuthenticated: true,
        user: (data.user ?? null) as User | null,
      };
    }
  }

  return { isAuthenticated: false, user: null };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const verifyOnce = useCallback(async () => {
    const res = await axiosInstance.get("/api/auth/verify", {
      withCredentials: true,
    });

    return extractVerify(res.data);
  }, []);

  const refresh = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const { isAuthenticated, user } = await verifyOnce();

      setAuthState((prev) => ({
        ...prev,
        user,
        isAuthenticated,
        loading: false,
      }));

      if (process.env.NODE_ENV !== "production") {
        console.log("[AuthProvider] Auth state refreshed:", {
          isAuthenticated,
          user: user?.username,
        });
      }
    } catch {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });

      if (process.env.NODE_ENV !== "production") {
        console.log("[AuthProvider] Auth refresh failed - user logged out");
      }
    }
  }, [verifyOnce]);

  useEffect(() => {
    // Fast-path from client-readable cookies (if present), otherwise verify via backend session.
    try {
      const { token, user } = authCookies.getAuthData();
      if (token && user) {
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });
        return;
      }
    } catch {
      // ignore and fall through to refresh
    }

    refresh();
  }, [refresh]);

  const login = useCallback(
    async (identifier: string, password: string): Promise<LoginResult> => {
      setAuthState((prev) => ({ ...prev, loading: true }));

      try {
        const response = await axiosInstance.post(
          "/api/auth/login",
          { identifier, password },
          { withCredentials: true }
        );

        const data = response.data;

        // Existing backend usage in the codebase: { success, data: { user, token } }
        if (response.status === 200 && data?.success && data?.data?.user) {
          const nextUser = data.data.user as User;
          const nextToken = (data.data.token ?? null) as string | null;

          if (nextToken) {
            authCookies.setAuthData(nextToken, nextUser);
          }

          setAuthState({
            user: nextUser,
            token: nextToken,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true } as const;
        }

        // If login sets only httpOnly cookie, fallback to verify.
        try {
          const { isAuthenticated, user } = await verifyOnce();
          setAuthState((prev) => ({
            ...prev,
            user,
            isAuthenticated,
            loading: false,
          }));
          if (isAuthenticated) return { success: true } as const;
        } catch {
          // ignore
        }

        return {
          success: false,
          error: String(data?.message || "Login failed"),
        } as const;
      } catch (error) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        return {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        } as const;
      }
    },
    [verifyOnce]
  );

  const logout = useCallback(async () => {
    try {
      await axiosInstance.get("/api/auth/logout", {
        withCredentials: true,
        headers: authState.token
          ? {
              Authorization: `Bearer ${authState.token}`,
            }
          : undefined,
      });
    } catch {
      // ignore
    } finally {
      authCookies.clearAuthData();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, [authState.token]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };
      if (prev.token) {
        authCookies.setAuthData(prev.token, updatedUser);
      }

      return { ...prev, user: updatedUser };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      loading: authState.loading,
      login,
      logout,
      updateUser,
      refresh,
    }),
    [
      authState.isAuthenticated,
      authState.loading,
      authState.token,
      authState.user,
      login,
      logout,
      refresh,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
