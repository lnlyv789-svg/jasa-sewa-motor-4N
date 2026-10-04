// src/data/dummyStats.js

/**
 * Statistik ringkas untuk Dashboard Admin.
 * Nanti saat migrasi ke Supabase, ganti dengan query agregasi:
 * - Total pendapatan: SUM(amount_paid) FROM orders
 * - Pesanan aktif: COUNT(*) FROM orders WHERE rental_status IN (...)
 * - dst.
 */
export const dummyStats = {
  // ==== 4 Stat Cards Utama ====
  totalRevenue: 2067500,        // Total amount_paid dari semua order (yang sudah bayar)
  monthlyRevenue: 1620000,      // Pendapatan bulan ini (September 2026)
  totalOrders: 7,               // Total semua order
  pendingVerification: 2,       // Order dengan status "menunggu_verifikasi"
  activeRentals: 2,             // Order dengan status "aktif"
  availableMotors: 12,          // Motor dengan status "available" (dari 15 total)
  totalMotors: 15,              // Total motor

  // ==== Statistik Mingguan (7 hari terakhir) ====
  // Untuk grafik sederhana di dashboard
  weeklyRevenue: [
    { day: "Sen", revenue: 0 },
    { day: "Sel", revenue: 170000 },
    { day: "Rab", revenue: 0 },
    { day: "Kam", revenue: 800000 },
    { day: "Jum", revenue: 595000 },
    { day: "Sab", revenue: 412500 },
    { day: "Min", revenue: 0 },
  ],

  // ==== Motor Paling Sering Disewa ====
  topMotors: [
    { motor_id: "m2", name: "Honda Beat (2025)", total_rented: 8, image: "/images/Motor Matic/Honda BeAT 2025.png" },
    { motor_id: "m3", name: "Honda Vario EVO 160 (2026)", total_rented: 6, image: "/images/Motor Matic/Honda Vario Evo 160 2026.png" },
    { motor_id: "m4", name: "Yamaha Aerox 155 (2021)", total_rented: 5, image: "/images/Motor Matic/Yamaha Aerox 155 2021.png" },
  ],
};

/**
 * Helper untuk format Rupiah
 */
export const formatRupiah = (num) => {
  return `Rp ${num.toLocaleString("id-ID")}`;
};

/**
 * Helper untuk format angka ringkas (misal: 1.6jt, 2.5rb)
 */
export const formatCompact = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
  return num.toString();
};