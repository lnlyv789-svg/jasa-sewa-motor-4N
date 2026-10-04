// src/services/motorService.js
import { supabase } from "../lib/supabase";

const mapMotorFromDB = (motor) => {
  if (!motor) return null;
  return {
    id: motor.id,
    name: motor.name,
    category: motor.category,
    price: motor.price_per_day,
    originalPrice: motor.original_price,
    rating: Number(motor.rating),
    image: motor.image_url,
    description: motor.description,
    status: motor.status,
    isPopular: motor.is_popular,
    createdAt: motor.created_at,
  };
};

/**
 * Mapping dari format komponen → format DB.
 * Dipakai saat create/update motor.
 */
const mapMotorToDB = (motor) => {
  return {
    name: motor.name,
    category: motor.category,
    price_per_day: motor.price,
    original_price: motor.originalPrice || null,
    rating: motor.rating,
    image_url: motor.image || null,
    description: motor.description,
    status: motor.status || "available",
    is_popular: motor.isPopular || false,
  };
};

// ============================================
// PUBLIC — Bisa diakses tanpa login
// ============================================

/**
 * Ambil semua motor
 */
export const getAllMotors = async () => {
  const { data, error } = await supabase
    .from("motors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal fetch motors:", error.message);
    return { success: false, error: error.message, data: [] };
  }

  return {
    success: true,
    data: data.map(mapMotorFromDB),
  };
};

/**
 * Ambil motor berdasarkan ID (UUID)
 */
export const getMotorById = async (id) => {
  if (!id) return { success: false, error: "ID tidak valid", data: null };

  const { data, error } = await supabase
    .from("motors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Gagal fetch motor:", error.message);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: mapMotorFromDB(data) };
};

/**
 * Ambil motor populer
 */
export const getPopularMotors = async (limit = 6) => {
  const { data, error } = await supabase
    .from("motors")
    .select("*")
    .eq("is_popular", true)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Gagal fetch popular motors:", error.message);
    return { success: false, error: error.message, data: [] };
  }

  return {
    success: true,
    data: data.map(mapMotorFromDB),
  };
};

/**
 * Ambil motor berdasarkan kategori
 */
export const getMotorsByCategory = async (category) => {
  // Kalau category = "Semua", ambil semua
  if (category === "Semua") {
    return getAllMotors();
  }

  const { data, error } = await supabase
    .from("motors")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal fetch motors by category:", error.message);
    return { success: false, error: error.message, data: [] };
  }

  return {
    success: true,
    data: data.map(mapMotorFromDB),
  };
};

// ============================================
// ADMIN — Butuh role admin
// ============================================

/**
 * Tambah motor baru
 */
export const createMotor = async (motorData) => {
  const dbPayload = mapMotorToDB(motorData);

  const { data, error } = await supabase
    .from("motors")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("Gagal create motor:", error.message);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: mapMotorFromDB(data) };
};

/**
 * Update motor
 */
export const updateMotor = async (id, motorData) => {
  const dbPayload = mapMotorToDB(motorData);

  const { data, error } = await supabase
    .from("motors")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Gagal update motor:", error.message);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: mapMotorFromDB(data) };
};

/**
 * Hapus motor
 */
export const deleteMotor = async (id) => {
  const { error } = await supabase
    .from("motors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Gagal delete motor:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
};