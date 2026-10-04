// src/pages/user/MotorDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Check,
  Shield,
  Calendar,
  Zap,
  Users,
  Gauge,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getMotorById, getMotorsByCategory } from "../../services/motorService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/Button";
import MotorCard from "../../components/MotorCard";

const MotorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [motor, setMotor] = useState(null);
  const [similarMotors, setSimilarMotors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ==== Fetch motor + similar motors ====
  useEffect(() => {
    const fetchMotor = async () => {
      setIsLoading(true);
      setErrorMsg("");

      const result = await getMotorById(id);

      if (!result.success || !result.data) {
        setErrorMsg("Motor tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      setMotor(result.data);

      // Fetch motor mirip (kategori sama)
      const similar = await getMotorsByCategory(result.data.category);
      if (similar.success) {
        const filtered = similar.data
          .filter((m) => m.id !== result.data.id)
          .slice(0, 3);
        setSimilarMotors(filtered);
      }

      setIsLoading(false);
    };

    if (id) fetchMotor();
  }, [id]);

  // ==== Handle klik sewa ====
  const handleSewa = () => {
    if (isLoggedIn) {
      navigate(`/booking/${motor.id}`);
    } else {
      navigate("/login");
    }
  };

  // ==== Render bintang rating ====
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? "fill-[#D4AF37] text-[#D4AF37]"
                : "text-gray-500 fill-gray-500"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-bold text-white">{rating}</span>
      </div>
    );
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-white/60 text-sm">Memuat detail motor...</p>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND / ERROR STATE
  // ============================================================
  if (errorMsg || !motor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-white mb-2">
          Motor tidak ditemukan
        </h1>
        <p className="text-white/60 mb-6">
          {errorMsg || "Motor yang kamu cari mungkin sudah tidak tersedia."}
        </p>
        <Button
          variant="solid"
          size="medium"
          onClick={() => navigate("/motor")}
          className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
        >
          ← Kembali ke Katalog
        </Button>
      </div>
    );
  }

  // ==== Spesifikasi (dummy per kategori) ====
  const specs = [
    {
      icon: Gauge,
      label: "Kecepatan Maks",
      value: motor.category === "Sport" ? "150 km/jam" : "100 km/jam",
    },
    {
      icon: Zap,
      label: "Kapasitas Mesin",
      value: motor.category === "Sport" ? "150-250cc" : "110-160cc",
    },
    { icon: Users, label: "Kapasitas", value: "2 Orang" },
    { icon: Calendar, label: "Tahun", value: "2020+" },
  ];

  // ==== Fasilitas ====
  const facilities = [
    "Helm SNI (2 buah)",
    "Jas hujan",
    "Asuransi kecelakaan",
    "P3K lengkap",
    "Free antar-jemput (≤ 5km)",
  ];

  return (
    <div className="pb-16">
      {/* ============================================================ */}
      {/* TOMBOL KEMBALI                                                */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-8">
        <button
          onClick={() => navigate("/motor")}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </button>
      </section>

      {/* ============================================================ */}
      {/* KONTEN UTAMA                                                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ==== KOLOM KIRI: GAMBAR ==== */}
          <div className="space-y-4">
            <div className="relative bg-[#15203D] rounded-3xl overflow-hidden border border-white/5 aspect-[4/3]">
              <img
                src={motor.image}
                alt={motor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop";
                }}
              />
              {motor.isPopular && (
                <span className="absolute top-4 right-4 bg-[#D4AF37] text-[#0B132B] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                  🔥 POPULER
                </span>
              )}
              <span className="absolute bottom-4 left-4 bg-[#0B132B]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                {motor.category}
              </span>
            </div>
          </div>

          {/* ==== KOLOM KANAN: INFO ==== */}
          <div className="space-y-6">
            {/* Nama + Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {motor.name}
              </h1>
              <div className="mt-3">{renderStars(motor.rating)}</div>
            </div>

            {/* Harga */}
            <div className="bg-[#15203D] rounded-2xl p-6 border border-[#D4AF37]/20">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                Harga Sewa
              </p>
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-black text-[#D4AF37]">
                  Rp {motor.price.toLocaleString("id-ID")}
                </span>
                <span className="text-white/60 text-sm mb-2">/hari</span>
                {motor.originalPrice && (
                  <span className="text-white/40 line-through text-sm mb-2 ml-auto">
                    Rp {motor.originalPrice.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              {motor.originalPrice && (
                <p className="text-xs text-[#FF6B35] font-bold mt-1">
                  💸 Hemat Rp{" "}
                  {(motor.originalPrice - motor.price).toLocaleString("id-ID")}
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
                Deskripsi
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                {motor.description}
              </p>
            </div>

            {/* Spesifikasi */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                Spesifikasi
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-[#15203D] rounded-xl p-3 border border-white/5"
                    >
                      <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-white/50 uppercase">
                          {spec.label}
                        </p>
                        <p className="text-sm font-bold text-white truncate">
                          {spec.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fasilitas */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                Fasilitas Gratis
              </h3>
              <div className="space-y-2">
                {facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {fac}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="solid"
                size="large"
                fullWidth
                onClick={handleSewa}
                disabled={
                  motor.status === "rented" || motor.status === "maintenance"
                }
                className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-black border-none shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {motor.status === "rented"
                  ? "🔒 Sedang Disewa"
                  : motor.status === "maintenance"
                    ? "🔧 Sedang Maintenance"
                    : "🏍️ Sewa Motor Ini"}
              </Button>
              <Button
                variant="outline"
                size="large"
                onClick={() => navigate("/motor")}
                className="border-white/20 text-white hover:bg-white/5"
              >
                Motor Lain
              </Button>
            </div>

            {/* Info Keamanan */}
            <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Dijamin Aman
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Semua motor diservis rutin dan dilengkapi asuransi kecelakaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MOTOR MIRIP                                                   */}
      {/* ============================================================ */}
      {similarMotors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-12">
          <h2 className="text-xl md:text-2xl font-black text-white mb-6">
            🏍️ Motor <span className="text-[#D4AF37]">Lain yang Mirip</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarMotors.map((m) => (
              <MotorCard key={m.id} motor={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MotorDetailPage;
