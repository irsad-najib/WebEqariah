/**
 * COOKIE UTILITIES
 * File ini ngurus semua yang berhubungan dengan cookies di browser
 */

import { COOKIE_NAMES } from "../constants";

/**
 * Class untuk ngurus cookies di browser
 */
export class ClientCookies {
  // Fungsi untuk AMBIL cookie
  static get(name: string): string | null {
    // Cek apakah lagi di browser atau server
    if (typeof window === "undefined") return null;

    // Ambil semua cookies
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    // Cari cookie yang sesuai nama
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }

    return null;
  }

  // Fungsi untuk SET (simpan) cookie
  static set(name: string, value: string, days = 7) {
    // Cek apakah lagi di browser
    if (typeof window === "undefined") return;

    // Hitung tanggal expired
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    // Simpan cookie
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  // Fungsi untuk HAPUS cookie
  static delete(name: string) {
    if (typeof window === "undefined") return;

    // Set tanggal expired ke masa lalu = otomatis terhapus
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}

/**
 * Helper functions khusus untuk authentication cookies
 * Ini yang bakal lo pakai di komponen-komponen
 */
export const authCookies = {
  // Simpan data login (token + user data)
  setAuthData: (token: string, userData: any) => {
    ClientCookies.set(COOKIE_NAMES.AUTH_TOKEN, token, 7); // 7 hari
    ClientCookies.set(COOKIE_NAMES.USER_DATA, JSON.stringify(userData), 7);
  },

  // Ambil data login
  getAuthData: () => {
    const token = ClientCookies.get(COOKIE_NAMES.AUTH_TOKEN);
    const userData = ClientCookies.get(COOKIE_NAMES.USER_DATA);

    return {
      token,
      user: userData ? JSON.parse(userData) : null,
    };
  },

  // Hapus semua data login (logout)
  clearAuthData: () => {
    ClientCookies.delete(COOKIE_NAMES.AUTH_TOKEN);
    ClientCookies.delete(COOKIE_NAMES.USER_DATA);
  },
};
