/**
 * TYPES UNTUK SEMUA DATA DI APLIKASI
 * File ini berisi definisi tipe data yang dipakai di seluruh aplikasi
 */

// ========== USER TYPES ==========
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "mosque_admin";
  affiliatedMosqueId?: string; // Optional, cuma ada kalo dia admin masjid
}

// ========== MOSQUE TYPES ==========
export interface Mosque {
  id: number;
  mosqueName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  contactPerson: string;
  contactPhone: string;
  imageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminId: string;
}

// ========== ANNOUNCEMENT TYPES ==========
export interface Announcement {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  authorId: string;
  mosqueId: number;
  mosque: Mosque;
  author?: User;
}

// ========== FORM TYPES ==========
export interface FormState {
  loading: boolean; // Lagi loading atau nggak
  error: string | Record<string, string> | null; // Error message
  success: boolean | string; // Success state
}

// ========== AUTH TYPES ==========
export interface AuthState {
  user: User | null; // Data user yang login
  token: string | null; // Token authentication
  isAuthenticated: boolean; // Udah login atau belum
  loading: boolean; // Lagi cek auth atau nggak
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  Authenticated?: boolean; // Sesuai response backend lo
}
