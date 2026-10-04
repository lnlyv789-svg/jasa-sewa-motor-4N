import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  // ==== Saat masih loading (belum tahu status login) ====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // ==== Belum login → redirect ke /login ====
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // ==== Butuh admin, tapi bukan admin → redirect ke /dashboard ====
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // ==== Butuh user biasa, tapi admin → boleh masuk (atau redirect ke /admin) ====
  // (Kita biarkan admin masuk ke halaman user juga, tidak masalah)

  // ==== Semua cek lolos → tampilkan halaman ====
  return <Outlet />;
};

export default ProtectedRoute;