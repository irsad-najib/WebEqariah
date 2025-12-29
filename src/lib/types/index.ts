/* eslint-disable @typescript-eslint/no-explicit-any */
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
  affiliated_mosque_id?: number; // Backend format, akan dihapus setelah standardisasi
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
  imageUrl?: string;
  url?: string | null; // Untuk kompatibilitas dengan dashboard
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminId: string;
}

// ========== SPEAKER TYPES ==========
export interface Speaker {
  id: number;
  name: string;
  bio?: string;
  photo_url?: string;
  expertise?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  approved_by?: number;
  approved_at?: string;
  announcements?: Announcement[];
}

// ========== KITAB TYPES ==========
export interface Kitab {
  id: number;
  judul: string;
  pengarang?: string;
  bidang_ilmu?: string;
  mazhab?: string;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
  approved_by?: number;
  approved_at?: string;
  announcements?: Announcement[];
}

// ========== ANNOUNCEMENT TYPES ==========
export interface Announcement {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  url?: string | null; // Untuk kompatibilitas dengan dashboard
  media_url?: string | null; // Backend format, akan dihapus setelah standardisasi
  createdAt: string;
  created_at?: string; // Backend format, akan dihapus setelah standardisasi
  authorId?: string;
  author_id?: number; // Backend format
  author_name?: string; // Backend format, akan dihapus setelah standardisasi
  mosqueId: number;
  mosque_id?: number; // Backend format, akan dihapus setelah standardisasi
  author?: User;
  mosque: Mosque;
  like_count?: number;
  comment_count?: number;
  liked_by_user?: boolean;
  mosqueInfo?: {
    id: number;
    name: string;
    image: string | null;
  };
  userInfo?: {
    id: number;
    username: string;
    email: string;
  } | null;
  type?: "announcement" | "kajian" | "marketplace" | string;
  speaker_name?: string | null;
  speakerName?: string | null;
  event_date?: string | null;
  eventDate?: string | null;
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
  Authenticated?: boolean; // Sesuai response backend
}

// ========== WebSocket TYPES ==========
export interface WebSocketMessage {
  type?: string; // Tipe pesan (new_announcement, update, delete, dll)
  data?: WebSocketAnnouncementData; // Data yang dikirim
  action?: string; // Action yang dilakukan (create, update, delete)
  id?: number | string; // ID resource
  content?: any;
  title?: string;
  media_url?: string | null;
  mosque_id?: number | string;
  author_name?: string;
  created_at?: string;
}

export interface WebSocketAnnouncementData {
  id: number | string;
  title: string;
  content: string;
  media_url?: string | null;
  mosque_id: number | string;
  author_name?: string;
  created_at: string;
  type?: string;
  speaker_name?: string;
  speakerName?: string;
  event_date?: string;
  eventDate?: string;
}

// ========== Socket Status ==========
export type ConnectionStatus = "Connecting" | "Open" | "Closed" | "Error";

// ========== Comment TYPES ==========
export interface Comment {
  id: number | string;
  content: string;
  user_id: number | string;
  username: string;
  created_at: string;
}

// ========== Register Form Data ==========
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  affiliateMosqueID?: number;
}
