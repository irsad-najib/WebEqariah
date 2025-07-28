/**
 * CONSTANTS - SEMUA NILAI TETAP DI APLIKASI
 * File ini berisi semua konstanta yang dipakai berulang-ulang
 */

// ========== API ENDPOINTS ==========
// Semua URL API yang lo pakai
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    VERIFY: "/api/auth/verify",
  },
  MOSQUE: {
    LIST: "/api/mosque/",
    DETAIL: "/api/mosque", // + /{id}
    REGISTER: "/api/mosque/register-mosque",
    UPLOAD_IMAGE: "/api/mosque/upload-image",
  },
  ANNOUNCEMENT: {
    LIST: "/api/announcement",
    CREATE: "/api/announcement",
    UPLOAD_IMAGE: "/api/mosque/upload-image",
  },
  ADMIN: {
    USERS: "/api/admin/users",
    MOSQUES: "/api/admin/mosques",
    ANNOUNCEMENTS: "/api/admin/announcements",
    APPROVE_MOSQUE: "/api/admin/approve-mosque", // + /{id}
  },
} as const;

// ========== USER ROLES ==========
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MOSQUE_ADMIN: "mosque_admin",
} as const;

// ========== COOKIE NAMES ==========
export const COOKIE_NAMES = {
  AUTH_TOKEN: "eqariah_auth_token",
  USER_DATA: "eqariah_user_data",
  THEME: "eqariah_theme",
} as const;

// ========== VALIDATION MESSAGES ==========
export const VALIDATION_MESSAGES = {
  REQUIRED: "Field ini wajib diisi",
  EMAIL_INVALID: "Format email tidak valid",
  PASSWORD_MIN: "Password minimal 8 karakter",
  PASSWORD_MISMATCH: "Password tidak sama",
  PHONE_INVALID: "Format nomor telepon tidak valid",
} as const;

// ========== LOADING STATES ==========
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;
