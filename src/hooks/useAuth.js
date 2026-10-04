// src/hooks/useAuth.js
import { useAuthContext } from "../context/AuthContext";

/**
 * Hook untuk akses data auth di seluruh aplikasi.
 * 
 * Sebelumnya: baca dari localStorage (dummy).
 * Sekarang: baca dari AuthContext (Supabase asli).
 * 
 * Semua halaman yang pakai useAuth() otomatis dapat data asli
 * TANPA perlu ubah kode mereka.
 */
export const useAuth = () => {
  const {
    user,
    profile,
    session,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    refetchProfile,
  } = useAuthContext();

  return {
    // ==== Data ====
    user,              // auth.users — { id, email, ... }
    profile,           // profiles — { full_name, phone, role, ... }
    session,           // Session object dari Supabase

    // ==== Status ====
    loading,           // Boolean — true saat fetch awal
    isLoggedIn,        // Boolean
    isAdmin,           // Boolean

    // ==== Aksi ====
    login,             // async (email, password)
    register,          // async (email, password, name, phone)
    logout,            // async ()
    updateProfile,     // async (updates)
    refetchProfile,    // async ()

    // ==== Alias untuk kompatibilitas dengan kode lama ====
    // Beberapa file lama pakai `user.full_name` — sekarang di `profile.full_name`
    // Kita buat alias `fullName` biar gampang dipakai:
    fullName: profile?.full_name || user?.email?.split("@")[0] || "User",
    role: profile?.role || "user",
  };
};