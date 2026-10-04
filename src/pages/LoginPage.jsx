// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ==== Handle login ====
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    // Validasi dasar
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email dan password wajib diisi.");
      setIsLoading(false);
      return;
    }

    // Panggil login dari AuthContext
    const result = await login(email, password);

    if (!result.success) {
      setErrorMsg(
        result.error === "Invalid login credentials"
          ? "Email atau password salah."
          : result.error,
      );
      setIsLoading(false);
      return;
    }

    // ==== Login berhasil — redirect ====
    // Cek dulu: apakah user datang dari booking?
    const fromBooking = location.state?.fromBooking;
    const targetMotorId = location.state?.motorId;

    if (fromBooking && targetMotorId) {
      navigate(`/booking/${targetMotorId}`);
    } else {
      // Redirect berdasarkan role dari hasil login
      if (result.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center px-4 py-12">
      <div className="bg-[#15203D] p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ornamen */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#D4AF37] bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">
            Selamat Datang Kembali
          </span>
          <h1 className="text-2xl font-black text-white pt-2">
            Masuk ke 4N Rental
          </h1>
          <p className="text-xs text-white/60">
            Gunakan akunmu untuk melanjutkan
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 relative z-10">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs text-white/70 mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              disabled={isLoading}
              className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1.5 font-medium">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#D4AF37] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-white/60 relative z-10">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-[#D4AF37] font-bold hover:underline transition-all"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
