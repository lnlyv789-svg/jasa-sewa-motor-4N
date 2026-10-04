// src/pages/user/ProfilePage.jsx
import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Lock, Save, Shield, Camera, Loader2, AlertCircle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import Button from "../../components/Button";

const ProfilePage = () => {
  const { user, profile, updateProfile, refetchProfile } = useAuth();

  // ==== State form data pribadi ====
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  // ==== State form password ====
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  // ==== State notifikasi & loading ====
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // ==== Prefill form dengan data profile ====
  useEffect(() => {
    if (profile || user) {
      setFormData({
        full_name: profile?.full_name || "",
        email: user?.email || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
      });
    }
  }, [profile, user]);

  // ==== Helper: tampilkan notifikasi ====
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  // ==== Handle submit data pribadi ====
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    // Validasi
    if (!formData.full_name.trim()) {
      showNotification("error", "Nama lengkap wajib diisi.");
      setSavingProfile(false);
      return;
    }
    if (!formData.phone.trim()) {
      showNotification("error", "Nomor WhatsApp wajib diisi.");
      setSavingProfile(false);
      return;
    }

    // Update ke Supabase
    const result = await updateProfile({
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim() || null,
    });

    if (!result.success) {
      showNotification("error", result.error || "Gagal memperbarui profil.");
      setSavingProfile(false);
      return;
    }

    // Refresh profile di context
    await refetchProfile();

    showNotification("success", "Profil berhasil diperbarui!");
    setSavingProfile(false);
  };

  // ==== Handle submit ganti password ====
  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password.length < 6) {
      showNotification("error", "Password minimal 6 karakter.");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      showNotification("error", "Konfirmasi password tidak cocok.");
      return;
    }

    setSavingPassword(true);

    // Update password via Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: passwordData.new_password,
    });

    if (error) {
      showNotification("error", error.message || "Gagal mengubah password.");
      setSavingPassword(false);
      return;
    }

    setPasswordData({ new_password: "", confirm_password: "" });
    showNotification("success", "Password berhasil diubah!");
    setSavingPassword(false);
  };

  return (
    <div className="pb-16">
      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pt-10 pb-6">
        <span className="inline-block text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 mb-4">
          Profil Saya
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          Pengaturan <span className="text-[#D4AF37]">Akun</span>
        </h1>
        <p className="text-white/60 mt-2 text-sm md:text-base">
          Kelola data pribadi dan keamanan akunmu.
        </p>
      </section>

      {/* NOTIFIKASI */}
      {notification.message && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pb-4">
          <div
            className={`rounded-xl p-4 text-sm font-medium border flex items-start gap-3 ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <span className="text-lg leading-none">✓</span>
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{notification.message}</span>
          </div>
        </section>
      )}

      {/* CARD PROFIL UTAMA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
        <div className="bg-gradient-to-br from-[#15203D] to-[#0B132B] rounded-3xl p-6 md:p-8 border border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B132B] font-black text-4xl shadow-2xl">
                {formData.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-9 h-9 bg-[#0B132B] border-2 border-[#D4AF37] rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B132B] transition-all"
                title="Ganti foto (segera hadir)"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-white">
                {formData.full_name || "Nama Belum Diisi"}
              </h2>
              <p className="text-white/60 text-sm mt-1">{formData.email}</p>
              <div className="flex items-center gap-2 justify-center md:justify-start mt-3">
                <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 uppercase tracking-wide">
                  {profile?.role === "admin" ? "👑 Admin" : "🏍️ Penyewa"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM DATA PRIBADI */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
        <div className="bg-[#15203D] rounded-2xl p-6 md:p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Data Pribadi</h3>
              <p className="text-xs text-white/50">
                Informasi ini akan digunakan saat booking.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  placeholder="Nama lengkap sesuai KTP"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email{" "}
                <span className="text-white/40 text-xs">(tidak dapat diubah)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-[#0B132B]/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  placeholder="081234567890"
                />
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Alamat Lengkap
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-white/40" />
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                  placeholder="Jl. Merdeka No. 10, Jakarta Selatan"
                />
              </div>
              <p className="text-xs text-white/40 mt-2">
                💡 Alamat ini akan otomatis terisi saat kamu booking motor.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="solid"
                size="medium"
                disabled={savingProfile}
                className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* FORM GANTI PASSWORD */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="bg-[#15203D] rounded-2xl p-6 md:p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="p-2.5 bg-[#FF6B35]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Keamanan</h3>
              <p className="text-xs text-white/50">
                Ubah password secara berkala untuk keamanan akun.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitPassword} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full bg-[#0B132B] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full bg-[#0B132B] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="solid"
                size="medium"
                disabled={savingPassword}
                className="bg-[#FF6B35] text-white hover:bg-[#e05a2a] font-bold border-none disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Ubah Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;