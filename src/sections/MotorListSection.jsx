// src/sections/MotorListSection.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAllMotors } from "../services/motorservice";
import MotorCard from "../components/MotorCard";

const MotorListSection = () => {
  const [motors, setMotors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");

  // ==== Fetch motor dari Supabase ====
  useEffect(() => {
    const fetchMotors = async () => {
      setIsLoading(true);
      const result = await getAllMotors();
      if (result.success) {
        setMotors(result.data);
      }
      setIsLoading(false);
    };
    fetchMotors();
  }, []);

  // ==== Filter motor ====
  const filteredMotors = useMemo(() => {
    let list = motors;
    if (activeFilter !== "Semua") {
      list = list.filter((m) => m.category === activeFilter);
    }
    // Tampilkan 6 motor saja di landing page
    return list.slice(0, 6);
  }, [motors, activeFilter]);

  const filters = ["Semua", "Matic", "Gigi", "Sport"];

  return (
    <section id="motor" className="py-16 md:py-24 bg-[#0B132B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">

        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm font-semibold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
            Koleksi Motor
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4">
            Motor Favorit <span className="text-[#D4AF37]">Pekan Ini</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mt-3 text-sm md:text-base">
            Pilih motor andalanmu, mulai petualangan, dan rasakan kebebasan
            <span className="hidden sm:inline"> menjelajahi setiap sudut Nusantara</span>.
          </p>
        </div>

        {/* Filter Kategori */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin mb-3" />
            <p className="text-white/50 text-sm">Memuat motor...</p>
          </div>
        )}

        {/* Grid Motor */}
        {!isLoading && (
          <>
            {filteredMotors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredMotors.map((motor) => (
                  <MotorCard key={motor.id} motor={motor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">
                Tidak ada motor di kategori ini.
              </div>
            )}

            {/* CTA Lihat Semua */}
            <div className="text-center mt-12">
              <p className="text-white/40 text-sm mb-3">
                Masih ingin lihat lebih banyak?
              </p>
              <Link
                to="/motor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#0B132B] font-bold hover:bg-[#c29d2b] transition-all shadow-lg shadow-[#D4AF37]/20"
              >
                Lihat Semua Motor →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MotorListSection;