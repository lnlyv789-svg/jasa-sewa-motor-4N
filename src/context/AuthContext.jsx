// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ==== 1. Buat context ====
const AuthContext = createContext(null);

// ==== 2. Provider component ====
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Data dari auth.users
  const [profile, setProfile] = useState(null); // Data dari tabel profiles
  const [loading, setLoading] = useState(true); // Saat fetch pertama kali
  const [session, setSession] = useState(null); // Sesi aktif

  // ==== Fungsi fetch profile dari tabel profiles ====
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Gagal fetch profile:", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  // ==== Effect: cek session saat app pertama dibuka ====
  useEffect(() => {
    // Cek session yang tersimpan
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Setup listener untuk perubahan auth (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    // Cleanup listener saat component unmount
    return () => subscription.unsubscribe();
  }, []);

  // ==== Fungsi login (UPDATED) ====
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // ← Fetch profile langsung biar dapat role
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    return {
      success: true,
      data,
      role: profileData?.role || "user", // ← Kembalikan role
    };
  };
  // ==== Fungsi register ====
  const register = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  };

  // ==== Fungsi logout ====
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Gagal logout:", error.message);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // ==== Fungsi update profile ====
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: "Belum login" };

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    setProfile(data);
    return { success: true, data };
  };

  // ==== Nilai yang dibagikan ke seluruh aplikasi ====
  const value = {
    user, // auth.users data
    profile, // profiles table data
    session, // session object
    loading, // status load awal
    isLoggedIn: !!user, // boolean
    isAdmin: profile?.role === "admin", // boolean
    login,
    register,
    logout,
    updateProfile,
    refetchProfile: () => fetchProfile(user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==== 3. Custom hook untuk pakai context ====
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext harus dipakai di dalam <AuthProvider>");
  }
  return context;
};
