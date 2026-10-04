// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ==== Handle perubahan input ====
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errorMsg) setErrorMsg("");
  };

  // ==== Validasi ====
  const validate = () => {
    if (!formData.fullName.trim()) return "Nama lengkap wajib diisi.";
    if (!formData.email.trim()) return "Email wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Format email tidak valid.";
    if (!formData.phone.trim()) return "Nomor WhatsApp wajib diisi.";
    if (formData.phone.length < 10) return "Nomor WhatsApp minimal 10 digit.";
    if (formData.password.length < 6) return "Password minimal 6 karakter.";
    if (formData.password !== formData.confirmPassword) {
      return "Konfirmasi password tidak cocok.";
    }
    return null;
  };

  // ==== Handle submit ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validasi
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);

    // Panggil register dari AuthContext
    const result = await register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    );

    if (!result.success) {
      setErrorMsg(
        result.error === "User already registered"
          ? "Email sudah terdaftar. Coba login atau pakai email lain."
          : result.error
      );
      setIsLoading(false);
      return;
    }

    setSuccessMsg("Akun berhasil dibuat! Mengalihkan...");
    setIsLoading(false);

    // Redirect ke dashboard setelah 1.5 detik
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4 py-20">
      <div className="max-w-md w-full bg-[#15203D] p-8 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden">

        {/* Ornamen */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest uppercase text-[#D4AF37] bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">
            Registrasi Akun
          </span>
          <h2 className="text-3xl font-black text-white">Gabung Bersama 4N</h2>
          <p className="text-white/60 mt-2 text-sm">
            Buat akun untuk kemudahan sewa motor
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 relative z-10">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4 relative z-10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-400">{successMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
              placeholder="nama@email.com"
            />
          </div>

          {/* No WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
              placeholder="081234567890"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
                placeholder="Ulangi password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#D4AF37] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <Button
            type="submit"
            variant="solid"
            fullWidth
            disabled={isLoading}
            className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] py-3 mt-4 text-base border-none font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Daftar Akun Sekarang"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/60 relative z-10">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-[#D4AF37] font-bold hover:underline transition-all"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;