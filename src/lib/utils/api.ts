import axios from "axios";
import { ApiResponse, User, Mosque, Announcement } from "../types";
import { authCookies } from "./cookies";
import { handleError } from "./errorHandler";

/**
 * Base API client
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { token } = authCookies.getAuthData();

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        // Parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }

        // Handle 401 - hanya clear cookies, TIDAK auto-redirect
        // Biarkan setiap halaman handle redirect sendiri
        if (response.status === 401) {
          authCookies.clearAuthData();
        }

        // Create error with proper structure
        const error = {
          type: response.status === 401 ? "AUTHENTICATION" : "SERVER",
          message:
            errorData.message ||
            errorData.error ||
            `Request failed with status ${response.status}`,
          statusCode: response.status,
          description: errorData.description,
        };

        throw error;
      }

      const data = await response.json();

      return {
        success: true,
        message: "Request successful",
        data,
      };
    } catch (error) {
      console.error("API Request failed:", error);
      const appError = handleError(error);

      return {
        success: false,
        message: appError.message,
        error: appError.description || appError.message,
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File upload method
  async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const { token } = authCookies.getAuthData();

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `Upload failed with status ${response.status}`,
          };
        }

        const error = {
          type: "SERVER",
          message: errorData.message || "Upload failed",
          statusCode: response.status,
        };

        throw error;
      }

      const data = await response.json();

      return {
        success: true,
        message: "Upload successful",
        data,
      };
    } catch (error) {
      const appError = handleError(error);
      return {
        success: false,
        message: appError.message,
        error: appError.description || appError.message,
      };
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient();

// Configure axios instance with timeout and size limits for video uploads
export const axiosInstance = axios.create({
  baseURL: "https://api.eqariah.com",
  withCredentials: true,
  timeout: 300000, // 5 minutes timeout for large video uploads
  maxContentLength: 100 * 1024 * 1024, // 100 MB max content length
  maxBodyLength: 100 * 1024 * 1024, // 100 MB max body length
});

// Add interceptors with better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors with better messaging
    const appError = handleError(error);
    console.error("API Error:", appError);

    // TIDAK ada auto-redirect untuk 401
    // Biarkan setiap halaman handle redirect sendiri
    // Ini memungkinkan user yang belum login tetap bisa browse halaman public
    // (home, mosque list, dll) tanpa di-redirect paksa ke login

    // Hanya clear cookies jika 401, tapi TIDAK redirect
    if (appError.statusCode === 401) {
      authCookies.clearAuthData();
    }

    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export const authApi = {
  // Login
  login: async (credentials: { identifier: string; password: string }) => {
    const response = await apiClient.post<{ token: string; user: User }>(
      "/api/auth/login",
      credentials
    );

    // Set cookies kalau berhasil
    if (response.success && response.data) {
      const { token, user } = response.data;
      if (token && user) {
        authCookies.setAuthData(token, user);
      }
    }

    return response;
  },

  // Register
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    affiliateMosqueID?: number;
  }) => {
    return apiClient.post("/api/auth/register", userData);
  },

  // Logout
  logout: async () => {
    const response = await apiClient.get("/api/auth/logout");

    // Clear cookies
    authCookies.clearAuthData();

    return response;
  },

  // Verify token
  verify: async () => {
    return apiClient.get("/api/auth/verify");
  },
};

// ========== MOSQUE API ==========
export const mosqueApi = {
  // Get all mosques
  getAll: async () => {
    return apiClient.get<Mosque[]>("/api/mosque/");
  },

  // Get mosque by ID
  getById: async (id: string | number) => {
    return apiClient.get<Mosque>(`/api/mosque/${id}`);
  },

  // Register new mosque
  register: async (mosqueData: {
    mosqueName: string;
    contactPerson: string;
    contactPhone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    imageUrl?: string;
  }) => {
    return apiClient.post("/api/mosque/register-mosque", mosqueData);
  },

  // Upload mosque image
  uploadImage: async (formData: FormData) => {
    return apiClient.uploadFile("/api/mosque/upload-image", formData);
  },

  // Update mosque
  update: async (id: string | number, mosqueData: Partial<Mosque>) => {
    return apiClient.put(`/api/mosque/${id}`, mosqueData);
  },

  // Delete mosque
  delete: async (id: string | number) => {
    return apiClient.delete(`/api/mosque/${id}`);
  },
};

// ========== ANNOUNCEMENT API ==========
export const announcementApi = {
  // Get all announcements
  getAll: async () => {
    return apiClient.get<Announcement[]>("/api/announcement");
  },

  // Get announcement by ID
  getById: async (id: string | number) => {
    return apiClient.get<Announcement>(`/api/announcement/${id}`);
  },

  // Create announcement
  create: async (announcementData: {
    title: string;
    content: string;
    url?: string;
    imageUrl?: string;
    mosqueId: number;
  }) => {
    return apiClient.post("/api/announcement", announcementData);
  },

  // Update announcement
  update: async (
    id: string | number,
    announcementData: Partial<Announcement>
  ) => {
    return apiClient.put(`/api/announcement/${id}`, announcementData);
  },

  // Delete announcement
  delete: async (id: string | number) => {
    return apiClient.delete(`/api/announcement/${id}`);
  },

  // Upload announcement image
  uploadImage: async (formData: FormData) => {
    return apiClient.uploadFile("/api/mosque/upload-image", formData);
  },
};

// ========== ADMIN API ==========
export const adminApi = {
  // Get all users
  getUsers: async () => {
    return apiClient.get<User[]>("/api/admin/users");
  },

  // Get all mosques for admin
  getMosques: async () => {
    return apiClient.get<Mosque[]>("/api/admin/mosques");
  },

  // Get all announcements for admin
  getAnnouncements: async () => {
    return apiClient.get<Announcement[]>("/api/admin/announcements");
  },

  // Approve mosque
  approveMosque: async (mosqueId: string | number) => {
    return apiClient.post(`/api/admin/approve-mosque/${mosqueId}`);
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    return apiClient.get("/api/admin/dashboard");
  },

  // Delete user
  deleteUser: async (userId: string) => {
    return apiClient.delete(`/api/admin/users/${userId}`);
  },

  // Update user role
  updateUserRole: async (userId: string, role: string) => {
    return apiClient.put(`/api/admin/users/${userId}/role`, { role });
  },
};

// ========== USER API ==========
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return apiClient.get<User>("/api/user/profile");
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>) => {
    return apiClient.put("/api/user/profile", userData);
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiClient.post("/api/user/change-password", passwordData);
  },
};
