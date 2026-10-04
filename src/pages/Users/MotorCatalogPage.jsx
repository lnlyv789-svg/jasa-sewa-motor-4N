// src/pages/user/MotorCatalogPage.jsx
import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getAllMotors } from "../../services/motorservice";
import MotorCard from "../../components/MotorCard";

const MotorCatalogPage = () => {
  const [motors, setMotors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("popular");

  const filters = ["Semua", "Matic", "Gigi", "Sport"];
  const sortOptions = [
    { value: "popular", label: "Paling Populer" },
    { value: "cheapest", label: "Harga Termurah" },
    { value: "expensive", label: "Harga Tertinggi" },
    { value: "rating", label: "Rating Tertinggi" },
  ];

  // ==== Fetch motor dari Supabase ====
  const fetchMotors = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const result = await getAllMotors();

    if (!result.success) {
      setErrorMsg(result.error || "Gagal memuat data motor.");
      setIsLoading(false);
      return;
    }

    setMotors(result.data);
    setIsLoading(false);
  };

  // ==== Fetch saat pertama kali mount ====
  useEffect(() => {
    fetchMotors();
  }, []);

  // ==== Filter + Search + Sort ====
  const filteredMotors = useMemo(() => {
    let list = [...motors];

    if (activeFilter !== "Semua") {
      list = list.filter((m) => m.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "cheapest":
        list.sort((a, b) => a.price - b.price);
        break;
      case "expensive":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return list;
  }, [motors, activeFilter, searchQuery, sortBy]);

  return (
    <div className="pb-16">
      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-10 pb-6">
        <div className="text-center md:text-left">
          <span className="inline-block text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 mb-4">
            Katalog Lengkap
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Temukan <span className="text-[#D4AF37]">Motor Impianmu</span>
          </h1>
          <p className="text-white/60 mt-2 text-sm md:text-base">
            {isLoading ? "Memuat data motor..." : `${motors.length} motor tersedia, siap menemani setiap perjalananmu.`}
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ERROR STATE                                                   */}
      {/* ============================================================ */}
      {errorMsg && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400 mb-1">Gagal Memuat Motor</p>
              <p className="text-xs text-red-300/80">{errorMsg}</p>
            </div>
            <button
              onClick={fetchMotors}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* SEARCH + SORT BAR                                             */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari motor... (contoh: Honda Beat)"
              className="w-full bg-[#15203D] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          <div className="relative md:w-64">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#15203D] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all appearance-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#15203D]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FILTER KATEGORI                                               */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFilter === f
                  ? "bg-[#D4AF37] text-[#0B132B] shadow-md shadow-[#D4AF37]/20"
                  : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* GRID MOTOR                                                    */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin mb-4" />
            <p className="text-white/60 text-sm">Memuat motor...</p>
          </div>
        )}

        {/* Content (setelah loading selesai) */}
        {!isLoading && !errorMsg && (
          <>
            {filteredMotors.length > 0 ? (
              <>
                <p className="text-sm text-white/50 mb-5">
                  Menampilkan <span className="text-[#D4AF37] font-bold">{filteredMotors.length}</span> motor
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMotors.map((motor) => (
                    <MotorCard key={motor.id} motor={motor} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Motor tidak ditemukan
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  Coba ubah kata kunci atau filter kategori.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("Semua");
                  }}
                  className="text-[#D4AF37] font-bold hover:underline text-sm"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MotorCatalogPage;