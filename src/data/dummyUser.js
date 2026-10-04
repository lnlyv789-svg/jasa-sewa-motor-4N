// src/data/dummyUser.js

// Data dummy user — format sesuai tabel "profiles" di Supabase
export const dummyUser = {
  id: "usr-0001",
  full_name: "Budi Santoso",
  email: "budi@email.com",
  phone: "081234567890",
  address: "Jl. Merdeka No. 10, Jakarta Selatan",
  role: "user", // 'user' | 'admin'
  created_at: "2026-09-01T10:00:00Z",
};

// Data dummy admin — untuk testing halaman admin nanti
export const dummyAdmin = {
  id: "adm-0001",
  full_name: "Admin 4N",
  email: "admin@4n.id",
  phone: "081122334455",
  address: "Garasi 4N Pusat, Jakarta",
  role: "admin",
  created_at: "2026-08-01T08:00:00Z",
};