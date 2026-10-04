// src/pages/user/RiwayatPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, ChevronRight, Package, Loader,
  CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw, Bike, ArrowLeft
} from "lucide-react";
import { getUserOrders } from "../../services/orderService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/Button";

const RiwayatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const fetchOrders = async () => {
    if (!user?.id) { setIsLoading(false); return; }
    setIsLoading(true);
    setErrorMsg("");
    const result = await getUserOrders(user.id);
    if (!result.success) {
      setErrorMsg(result.error || "Gagal memuat riwayat pesanan.");
      setIsLoading(false);
      return;
    }
    setOrders(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "aktif":
        return orders.filter((o) => ["pending", "menunggu_verifikasi", "dikonfirmasi", "aktif"].includes(o.rentalStatus));
      case "selesai":
        return orders.filter((o) => o.rentalStatus === "selesai");
      case "batal":
        return orders.filter((o) => o.rentalStatus === "dibatalkan");
      case "semua":
      default:
        return orders;
    }
  }, [orders, activeTab]);

  const counts = useMemo(() => ({
    semua: orders.length,
    aktif: orders.filter((o) => ["pending", "menunggu_verifikasi", "dikonfirmasi", "aktif"].includes(o.rentalStatus)).length,
    selesai: orders.filter((o) => o.rentalStatus === "selesai").length,
    batal: orders.filter((o) => o.rentalStatus === "dibatalkan").length,
  }), [orders]);

  const StatusBadge = ({ status }) => {
    const map = {
      pending: { label: "Menunggu Pembayaran", color: "bg-[#F9A826]/20 text-[#F9A826] border-[#F9A826]/30" },
      menunggu_verifikasi: { label: "Menunggu Verifikasi", color: "bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30" },
      dikonfirmasi: { label: "Siap Diambil", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      aktif: { label: "Sedang Disewa", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      selesai: { label: "Selesai", color: "bg-white/10 text-white/60 border-white/20" },
      dibatalkan: { label: "Dibatalkan", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const s = map[status] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
  };

  const tabs = [
    { id: "semua", label: "Semua", count: counts.semua },
    { id: "aktif", label: "Aktif", count: counts.aktif },
    { id: "selesai", label: "Selesai", count: counts.selesai },
    { id: "batal", label: "Dibatalkan", count: counts.batal },
  ];

  return (
    <div className="pb-16">
      {/* TOMBOL KEMBALI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-8">
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </button>
      </section>

      {/* HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-6 pb-6">
        <span className="inline-block text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 mb-4">
          Riwayat Sewa
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          Semua <span className="text-[#D4AF37]">Pesananmu</span>
        </h1>
        <p className="text-white/60 mt-2 text-sm md:text-base">
          Lihat status, detail, dan invoice dari setiap penyewaan.
        </p>
      </section>

      {/* ERROR */}
      {errorMsg && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400 mb-1">Gagal Memuat Riwayat</p>
              <p className="text-xs text-red-300/80">{errorMsg}</p>
            </div>
            <button onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        </section>
      )}

      {/* TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-[#0B132B] shadow-md shadow-[#D4AF37]/20"
                  : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
              }`}>
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-[#0B132B]/20 text-[#0B132B]" : "bg-white/10 text-white/60"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* LIST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        {isLoading && (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin mb-3" />
            <p className="text-white/50 text-sm">Memuat riwayat pesanan...</p>
          </div>
        )}

        {!isLoading && !errorMsg && (
          <>
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-[#15203D] rounded-2xl p-4 md:p-5 border border-white/5 hover:border-[#D4AF37]/30 transition-all">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      {order.motorImage ? (
                        <img src={order.motorImage} alt={order.motorName || "Motor"}
                          className="w-full md:w-32 h-40 md:h-24 object-cover rounded-xl bg-[#0B132B] flex-shrink-0"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop"; }} />
                      ) : (
                        <div className="w-full md:w-32 h-40 md:h-24 rounded-xl bg-[#0B132B] flex items-center justify-center flex-shrink-0">
                          <Bike className="w-12 h-12 text-white/20" strokeWidth={1.5} />
                        </div>
                      )}

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-black text-white truncate">{order.motorName || order.orderId}</h3>
                          <StatusBadge status={order.rentalStatus} />
                        </div>
                        <p className="text-xs text-white/40 font-mono">{order.orderId}</p>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {order.startDate} • {order.durationDays} hari
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {order.invoiceNumber}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-3 flex-wrap pt-1">
                          <span className="text-lg font-black text-[#D4AF37]">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
                          {order.paymentType === "dp" && order.amountDue > 0 && (
                            <span className="text-xs text-[#FF6B35] font-bold">
                              DP: Rp {order.amountPaid.toLocaleString("id-ID")} • Sisa: Rp {order.amountDue.toLocaleString("id-ID")}
                            </span>
                          )}
                          {order.paymentType === "full" && order.paymentStatus === "paid" && (
                            <span className="text-xs text-emerald-400 font-bold">✓ Lunas</span>
                          )}
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 md:w-40">
                        <Button variant="outline" size="small" fullWidth
                          className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B132B]"
                          onClick={() => navigate(`/riwayat/${order.id}`)}>
                          Lihat Detail
                        </Button>
                        {order.paymentType === "dp" && order.amountDue > 0 && order.rentalStatus !== "dibatalkan" && (
                          <Button variant="solid" size="small" fullWidth
                            className="bg-[#FF6B35] text-white hover:bg-[#e05a2a] font-bold border-none"
                            onClick={() => navigate(`/riwayat/${order.id}`)}>
                            Bayar Sisa
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#15203D] rounded-2xl border border-white/5">
                {activeTab === "aktif" && <Loader className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />}
                {activeTab === "selesai" && <CheckCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />}
                {activeTab === "batal" && <XCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />}
                {activeTab === "semua" && <Package className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />}
                <h3 className="text-xl font-bold text-white mb-2">
                  {orders.length === 0 ? "Belum Ada Pesanan"
                    : `Tidak Ada Pesanan ${activeTab !== "semua" ? `di Kategori ${tabs.find((t) => t.id === activeTab)?.label}` : ""}`}
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  {orders.length === 0 ? "Yuk, mulai petualanganmu dengan menyewa motor 4N!" : "Coba pilih tab lain atau mulai pesanan baru."}
                </p>
                <Button variant="solid" size="medium"
                  className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
                  onClick={() => navigate("/motor")}>
                  🔥 Cari Motor Sekarang
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default RiwayatPage;