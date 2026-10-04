// src/pages/user/OrderDetailPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, Shield, CreditCard,
  Download, XCircle, CheckCircle2, AlertCircle, Bike, User,
  Loader2, X, AlertTriangle, Building2, Package
} from "lucide-react";
import { getOrderById, cancelOrder, calculateRefundPercentage } from "../../services/orderService";
import Button from "../../components/Button";

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "BSI", "CIMB", "Permata", "BTN", "Danamon", "Lainnya"];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [bankName, setBankName] = useState("BCA");
  const [bankAccount, setBankAccount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg("");
      const orderResult = await getOrderById(orderId);
      if (!orderResult.success || !orderResult.data) {
        setErrorMsg("Pesanan tidak ditemukan.");
        setIsLoading(false);
        return;
      }
      setOrder(orderResult.data);
      setIsLoading(false);
    };
    if (orderId) fetchData();
  }, [orderId]);

  const refundPreview = useMemo(() => {
    if (!order) return { percentage: 0, amount: 0, message: "" };
    const percentage = calculateRefundPercentage(order.startDate);
    const amount = Math.round((order.amountPaid || 0) * (percentage / 100));
    let message = "";
    if (percentage === 100) message = "Refund penuh (≥ H-7)";
    else if (percentage === 50) message = "Refund setengah (H-4 s/d H-6)";
    else message = "DP hangus (kurang dari H-4)";
    return { percentage, amount, message };
  }, [order]);

  const handleConfirmCancel = async () => {
    if (!order) return;
    if (refundPreview.amount > 0 && !bankAccount.trim()) {
      setCancelError("Nomor rekening wajib diisi untuk menerima refund.");
      return;
    }
    setIsCancelling(true);
    setCancelError("");
    const result = await cancelOrder(order.id, order, { bankName, bankAccount: bankAccount.trim() });
    if (!result.success) {
      setCancelError(result.error || "Gagal membatalkan pesanan.");
      setIsCancelling(false);
      return;
    }
    setOrder(result.data);
    setIsCancelling(false);
    setIsCancelModalOpen(false);
  };

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-white/60 text-sm">Memuat detail pesanan...</p>
      </div>
    );
  }

  // ===== NOT FOUND =====
  if (errorMsg || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-black text-white mb-2">Pesanan tidak ditemukan</h1>
        <p className="text-white/60 mb-6">{errorMsg || "Pesanan ini mungkin sudah dihapus."}</p>
        <Button variant="solid" size="medium" onClick={() => navigate("/riwayat")}
          className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none">
          ← Kembali ke Riwayat
        </Button>
      </div>
    );
  }

  const StatusBadge = ({ status, size = "md" }) => {
    const map = {
      pending: { label: "Menunggu Pembayaran", color: "bg-[#F9A826]/20 text-[#F9A826] border-[#F9A826]/30" },
      menunggu_verifikasi: { label: "Menunggu Verifikasi", color: "bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30" },
      dikonfirmasi: { label: "Siap Diambil", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      aktif: { label: "Sedang Disewa", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      selesai: { label: "Selesai", color: "bg-white/10 text-white/60 border-white/20" },
      dibatalkan: { label: "Dibatalkan", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const s = map[status] || map.pending;
    const sizeClass = size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";
    return <span className={`font-bold rounded-full border ${s.color} ${sizeClass}`}>{s.label}</span>;
  };

  const buildTimeline = () => {
    const statusOrder = ["pending", "menunggu_verifikasi", "dikonfirmasi", "aktif", "selesai"];
    const currentIdx = statusOrder.indexOf(order.rentalStatus);
    const isCancelled = order.rentalStatus === "dibatalkan";

    const steps = [
      { key: "created", label: "Pesanan Dibuat", icon: CheckCircle2, done: true },
      { key: "paid", label: order.paymentType === "dp" ? "DP Dibayar" : "Pembayaran Lunas", icon: CheckCircle2, done: order.paymentStatus !== "unpaid" },
      { key: "verified", label: "Dikonfirmasi", icon: CheckCircle2, done: currentIdx >= 2 },
      { key: "active", label: "Motor Diambil", icon: Package, done: currentIdx >= 3 },
      { key: "done", label: "Selesai", icon: CheckCircle2, done: currentIdx >= 4 },
    ];
    return { steps, isCancelled };
  };

  const { steps, isCancelled } = buildTimeline();

  const canPayRemaining = order.paymentType === "dp" && order.amountDue > 0 && order.rentalStatus !== "dibatalkan";
  const canCancel = ["pending", "menunggu_verifikasi", "dikonfirmasi"].includes(order.rentalStatus);
  const canDownloadInvoice = order.paymentStatus !== "unpaid";

  // ==== Info banner (kontekstual per status) ====
  const renderInfoBanner = () => {
    if (order.rentalStatus === "dikonfirmasi") {
      return (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 flex items-start gap-3">
          <Package className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-400">📦 Motor Siap Diambil</p>
            <p className="text-xs text-blue-300/80 mt-1">
              Pesananmu sudah dikonfirmasi admin. Silakan datang ke garasi 4N untuk mengambil motor dan menyerahkan identitas asli.
            </p>
          </div>
        </div>
      );
    }
    if (order.rentalStatus === "aktif") {
      return (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-3">
          <Bike className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-400">🏍️ Motor Sedang Disewa</p>
            <p className="text-xs text-emerald-300/80 mt-1">
              Selamat menikmati petualanganmu! Kembalikan motor sesuai jadwal agar identitas bisa diambil kembali.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-16">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pt-8">
        <button onClick={() => navigate("/riwayat")}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Riwayat
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Invoice</p>
            <h1 className="text-2xl md:text-3xl font-black text-white font-mono">{order.invoiceNumber}</h1>
            <p className="text-xs text-white/40 mt-1">Order ID: {order.orderId}</p>
          </div>
          <StatusBadge status={order.rentalStatus} size="lg" />
        </div>
      </section>

      {/* INFO BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
        {renderInfoBanner()}
      </section>

      {/* TIMELINE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 pb-6">
        <div className="bg-[#15203D] rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6">📍 Status Pesanan</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
            <div className="hidden md:block absolute top-5 left-0 h-0.5 bg-[#D4AF37] transition-all duration-500"
              style={{ width: `${Math.min((steps.filter((t) => t.done).length / steps.length) * 100, 100)}%` }} />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 transition-all ${step.done ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B132B]" : "bg-[#0B132B] border-white/20 text-white/40"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="md:mt-2">
                      <p className={`text-xs font-bold ${step.done ? "text-white" : "text-white/40"}`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isCancelled && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-400">Pesanan Dibatalkan</p>
                  {order.cancelledAt && (
                    <p className="text-xs text-red-300/80 mt-0.5">
                      Dibatalkan pada {new Date(order.cancelledAt).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  {order.refundAmount > 0 && (
                    <>
                      <p className="text-xs text-red-300/80 mt-1">
                        Refund: <span className="font-bold">Rp {order.refundAmount.toLocaleString("id-ID")}</span> •{" "}
                        Status: <span className="font-bold uppercase">{order.refundStatus}</span>
                      </p>
                      {order.refundBankName && order.refundBankAccount && (
                        <p className="text-xs text-red-300/80 mt-0.5">
                          Rekening: <span className="font-bold">{order.refundBankName} - {order.refundBankAccount}</span>
                        </p>
                      )}
                      {order.refundNote && (
                        <p className="text-xs text-red-300/60 mt-0.5 italic">"{order.refundNote}"</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KONTEN */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Motor */}
            <div className="bg-[#15203D] rounded-2xl overflow-hidden border border-white/5">
              <div className="flex flex-col sm:flex-row gap-4 p-5">
                {order.motorImage ? (
                  <img src={order.motorImage} alt={order.motorName || "Motor"}
                    className="w-full sm:w-32 h-32 object-cover rounded-xl bg-[#0B132B] flex-shrink-0"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop"; }} />
                ) : (
                  <div className="w-full sm:w-32 h-32 rounded-xl bg-[#0B132B] flex items-center justify-center flex-shrink-0">
                    <Bike className="w-12 h-12 text-white/20" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-black text-white text-lg">{order.motorName || "Motor tidak tersedia"}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {order.startDate} • {order.durationDays} hari
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Selesai: {new Date(new Date(order.startDate).getTime() + order.durationDays * 86400000).toISOString().split("T")[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Penyewa */}
            <div className="bg-[#15203D] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Detail Penyewa</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Nama Lengkap</p>
                  <p className="text-white font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Email</p>
                  <p className="text-white font-medium truncate">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">No WhatsApp</p>
                  <p className="text-white font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Metode Pengambilan</p>
                  <p className="text-white font-medium">{order.pickupMethod === "delivery" ? "🏠 Diantar" : "🏍️ Ambil Sendiri"}</p>
                </div>
              </div>
              {order.pickupMethod === "delivery" && order.deliveryAddress && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Alamat Pengantaran
                  </p>
                  <p className="text-sm text-white/80">{order.deliveryAddress}</p>
                </div>
              )}
            </div>

            {/* Identitas */}
            <div className="bg-[#15203D] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Identitas yang Ditahan</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Jenis Identitas</p>
                  <p className="text-white font-bold uppercase">
                    {order.identityType === "ktp" && "KTP"}
                    {order.identityType === "sim_c" && "SIM C"}
                    {order.identityType === "sim_a" && "SIM A"}
                    {order.identityType === "paspor" && "Paspor"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50 mb-1">Status</p>
                  {order.identityHeld ? (
                    <span className="text-xs font-bold text-[#F9A826] bg-[#F9A826]/10 px-3 py-1 rounded-full border border-[#F9A826]/30">🟡 Sedang Ditahan</span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">✅ Belum Ditahan</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KANAN */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-[#15203D] rounded-2xl p-5 border border-[#D4AF37]/20">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Rincian Biaya</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Total Sewa</span>
                    <span className="text-white font-medium">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Sudah Dibayar</span>
                      <span className="text-emerald-400 font-bold">Rp {order.amountPaid.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Sisa</span>
                      <span className={order.amountDue > 0 ? "text-[#FF6B35] font-bold" : "text-emerald-400 font-bold"}>Rp {order.amountDue.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {order.paymentStatus === "paid" && (<><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-xs font-bold text-emerald-400">LUNAS</span></>)}
                      {order.paymentStatus === "partial_paid" && (<><AlertCircle className="w-4 h-4 text-[#F9A826]" /><span className="text-xs font-bold text-[#F9A826]">DP TERBAYAR</span></>)}
                      {order.paymentStatus === "unpaid" && (<><AlertCircle className="w-4 h-4 text-red-400" /><span className="text-xs font-bold text-red-400">BELUM BAYAR</span></>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {canPayRemaining && (
                  <Button variant="solid" size="medium" fullWidth
                    onClick={() => navigate(`/checkout/${order.orderId}?stage=settlement`)}
                    className="bg-[#FF6B35] text-white hover:bg-[#e05a2a] font-bold border-none">
                    💰 Bayar Sisa Rp {order.amountDue.toLocaleString("id-ID")}
                  </Button>
                )}

                {canDownloadInvoice && (
                  <Button variant="outline" size="medium" fullWidth
                    onClick={() => navigate(`/invoice/${order.orderId}`)}
                    className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B132B]">
                    <Download className="w-4 h-4 mr-2" />
                    Lihat Invoice
                  </Button>
                )}

                {canCancel && (
                  <Button variant="ghost" size="medium" fullWidth
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-red-400 hover:bg-red-500/10">
                    <XCircle className="w-4 h-4 mr-2" />
                    Batalkan Pesanan
                  </Button>
                )}
              </div>

              <div className="bg-[#15203D] rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-white/50 leading-relaxed">
                  Butuh bantuan? Hubungi admin via <span className="text-[#D4AF37] font-bold cursor-pointer hover:underline">WhatsApp</span> atau email <span className="text-[#D4AF37] font-bold">cs@4n.id</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL CANCEL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#15203D] rounded-2xl w-full max-w-md border border-[#D4AF37]/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Batalkan Pesanan?</h3>
                  <p className="text-xs text-white/50">{order.orderId}</p>
                </div>
              </div>
              {!isCancelling && (
                <button onClick={() => setIsCancelModalOpen(false)} className="text-white/40 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-[#0B132B] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Motor</span>
                  <span className="font-bold text-white text-right">{order.motorName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Tanggal Mulai</span>
                  <span className="font-bold text-white">{order.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Sudah Dibayar</span>
                  <span className="font-bold text-emerald-400">Rp {order.amountPaid.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="bg-[#0B132B] rounded-xl p-4">
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">⚡ Kebijakan Refund</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-white/60">Cancel ≥ H-7</span><span className="font-bold text-emerald-400">Refund 100%</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Cancel H-4 s/d H-6</span><span className="font-bold text-[#F9A826]">Refund 50%</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Cancel kurang dari H-4</span><span className="font-bold text-red-400">Hangus (0%)</span></div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border ${refundPreview.amount > 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                <p className="text-xs font-bold mb-1.5 text-white/70">Estimasi Refund Kamu:</p>
                <p className={`text-2xl font-black ${refundPreview.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  Rp {refundPreview.amount.toLocaleString("id-ID")}
                </p>
                <p className={`text-xs mt-1 ${refundPreview.amount > 0 ? "text-emerald-400/80" : "text-red-400/80"}`}>
                  {refundPreview.message}
                </p>
              </div>

              {refundPreview.amount > 0 && (
                <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-300/90 leading-relaxed">
                      Isi rekening tujuan agar admin bisa transfer refund kamu.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Nama Bank <span className="text-red-400">*</span>
                    </label>
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                      {BANKS.map((b) => (<option key={b} value={b} className="bg-[#0B132B]">{b}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Nomor Rekening <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Contoh: 1234567890 a.n. Awan Kurniawan"
                      className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 bg-[#F9A826]/10 border border-[#F9A826]/30 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-[#F9A826] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#F9A826]/90 leading-relaxed">
                  Aksi ini <strong>tidak bisa dibatalkan</strong>. Admin akan memproses refund manual dalam 3-5 hari kerja.
                </p>
              </div>

              {cancelError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{cancelError}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/10 flex gap-3 flex-shrink-0">
              <button onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white/70 hover:bg-white/5 transition-all disabled:opacity-50">
                Kembali
              </button>
              <button onClick={handleConfirmCancel} disabled={isCancelling}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isCancelling ? (<><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>) : ("Ya, Batalkan")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;