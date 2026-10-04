// src/pages/user/DashboardPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike, Wallet, Gift, ChevronRight, Calendar, Clock, Loader2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getAllMotors } from "../../services/motorService";
import { getUserOrders } from "../../services/orderService";
import MotorCard from "../../components/MotorCard";
import Button from "../../components/Button";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [activeFilter, setActiveFilter] = useState("Semua");
  const [motors, setMotors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==== Fetch motor + orders ====
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const [motorsResult, ordersResult] = await Promise.all([
        getAllMotors(),
        getUserOrders(user.id),
      ]);

      if (motorsResult.success) setMotors(motorsResult.data);
      if (ordersResult.success) setOrders(ordersResult.data);

      setIsLoading(false);
    };

    fetchData();
  }, [user?.id]);

  // ==== Statistik user ====
  const stats = useMemo(() => {
    const totalSewa = orders.length;
    const totalBelanja = orders
      .filter((o) => o.rentalStatus !== "dibatalkan")
      .reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    const voucher = 0;
    return { totalSewa, totalBelanja, voucher };
  }, [orders]);

  // ==== Sewa aktif & riwayat ====
  const activeOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["pending", "menunggu_verifikasi", "aktif"].includes(o.rentalStatus)
      ),
    [orders]
  );

  const historyOrders = useMemo(
    () =>
      orders
        .filter((o) => ["selesai", "dibatalkan"].includes(o.rentalStatus))
        .slice(0, 3),
    [orders]
  );

  // ==== Filter motor ====
  const filteredMotors = useMemo(() => {
    let list = motors;
    if (activeFilter !== "Semua") {
      list = list.filter((m) => m.category === activeFilter);
    }
    return list.slice(0, 6);
  }, [motors, activeFilter]);

  const filters = ["Semua", "Matic", "Gigi", "Sport"];

  // ==== Status Badge ====
  const StatusBadge = ({ status }) => {
    const map = {
      pending: { label: "Menunggu Pembayaran", color: "bg-[#F9A826]/20 text-[#F9A826] border-[#F9A826]/30" },
      menunggu_verifikasi: { label: "Menunggu Verifikasi", color: "bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30" },
      aktif: { label: "Sedang Disewa", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      selesai: { label: "Selesai", color: "bg-white/10 text-white/60 border-white/20" },
      dibatalkan: { label: "Dibatalkan", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="pb-16">
      {/* ============================================================ */}
      {/* SECTION 1: HERO SAPAAN                                        */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-10 pb-6">
        <div className="bg-gradient-to-br from-[#15203D] to-[#0B132B] rounded-3xl p-6 md:p-10 border border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <span className="inline-block text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 mb-4">
              Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              👋 Selamat datang, {profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Petualang"}!
            </h1>
            <p className="text-white/60 mt-2 text-sm md:text-base">
              Siap untuk petualangan berikutnya? Motor terbaik sudah menunggumu.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant="solid"
                size="medium"
                className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
                onClick={() => navigate("/motor")}
              >
                🔥 Sewa Motor Sekarang
              </Button>
              <Button
                variant="outline"
                size="medium"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/riwayat")}
              >
                📜 Riwayat Saya
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: RINGKASAN AKTIVITAS                                */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                <Bike className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{stats.totalSewa}</p>
            <p className="text-sm text-white/50 mt-1">Total Sewa</p>
          </div>

          <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                <Wallet className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#D4AF37]">
              Rp {stats.totalBelanja.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-white/50 mt-1">Total Belanja</p>
          </div>

          <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                <Gift className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{stats.voucher}</p>
            <p className="text-sm text-white/50 mt-1">Voucher Aktif</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: SEWA AKTIF                                         */}
      {/* ============================================================ */}
      {!isLoading && activeOrders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-white">
              🏍️ Sewa <span className="text-[#D4AF37]">Aktif</span>
            </h2>
            <button
              onClick={() => navigate("/riwayat")}
              className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#15203D] rounded-2xl p-4 md:p-5 border border-white/5 hover:border-[#D4AF37]/30 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  {/* Gambar Motor */}
                  {order.motorImage ? (
                    <img
                      src={order.motorImage}
                      alt={order.motorName || "Motor"}
                      className="w-full md:w-32 h-40 md:h-24 object-cover rounded-xl bg-[#0B132B] flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-full md:w-32 h-40 md:h-24 rounded-xl bg-[#0B132B] flex items-center justify-center flex-shrink-0">
                      <Bike className="w-12 h-12 text-white/20" strokeWidth={1.5} />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-white truncate">
                        {order.motorName || order.orderId}
                      </h3>
                      <StatusBadge status={order.rentalStatus} />
                    </div>
                    <p className="text-xs text-white/40 font-mono">{order.orderId}</p>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {order.startDate} • {order.durationDays} hari
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {order.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 pt-1">
                      <span className="text-lg font-black text-[#D4AF37]">
                        Rp {order.totalPrice.toLocaleString("id-ID")}
                      </span>
                      {order.paymentType === "dp" && (
                        <span className="text-xs text-[#FF6B35] font-bold">
                          DP: Rp {order.amountPaid.toLocaleString("id-ID")} • Sisa: Rp {order.amountDue.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 md:w-40">
                    <Button
                      variant="outline"
                      size="small"
                      fullWidth
                      className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B132B]"
                      onClick={() => navigate(`/riwayat/${order.id}`)}
                    >
                      Lihat Detail
                    </Button>
                    {order.paymentType === "dp" && order.amountDue > 0 && (
                      <Button
                        variant="solid"
                        size="small"
                        fullWidth
                        className="bg-[#FF6B35] text-white hover:bg-[#e05a2a] font-bold border-none"
                        onClick={() => navigate(`/riwayat/${order.id}`)}
                      >
                        Bayar Sisa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* SECTION 4: KATALOG MOTOR                                      */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-xl md:text-2xl font-black text-white">
            🔥 Katalog <span className="text-[#D4AF37]">Motor 4N</span>
          </h2>
          <button
            onClick={() => navigate("/motor")}
            className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4AF37] mx-auto animate-spin mb-3" />
            <p className="text-white/50 text-sm">Memuat motor...</p>
          </div>
        ) : filteredMotors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMotors.map((motor) => (
              <MotorCard key={motor.id} motor={motor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/50">
            Tidak ada motor di kategori ini.
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: RIWAYAT TERAKHIR                                   */}
      {/* ============================================================ */}
      {!isLoading && historyOrders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-white">
              📜 Riwayat <span className="text-[#D4AF37]">Terakhir</span>
            </h2>
            <button
              onClick={() => navigate("/riwayat")}
              className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {historyOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/riwayat/${order.id}`)}
                className="bg-[#15203D] rounded-xl p-3 md:p-4 border border-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer group flex items-center gap-4"
              >
                {order.motorImage ? (
                  <img
                    src={order.motorImage}
                    alt={order.motorName || "Motor"}
                    className="w-16 h-16 object-cover rounded-lg bg-[#0B132B] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#0B132B] flex items-center justify-center flex-shrink-0">
                    <Bike className="w-7 h-7 text-white/20" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">
                    {order.motorName || order.orderId}
                  </p>
                  <p className="text-xs text-white/50">
                    {order.startDate} • {order.durationDays} hari
                  </p>
                </div>
                <div className="hidden sm:block">
                  <StatusBadge status={order.rentalStatus} />
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;