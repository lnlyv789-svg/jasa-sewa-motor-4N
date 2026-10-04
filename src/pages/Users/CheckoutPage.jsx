// src/pages/user/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, CreditCard, QrCode, Wallet, Building2,
  CheckCircle2, Loader2, Info, User, Calendar, MapPin, AlertCircle
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getOrderByOrderId } from "../../services/orderService";
import { getMotorById } from "../../services/motorService";
import Button from "../../components/Button";

const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [motor, setMotor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg("");
      const orderResult = await getOrderByOrderId(orderId);
      if (!orderResult.success || !orderResult.data) {
        setErrorMsg("Data pesanan tidak ditemukan.");
        setIsLoading(false);
        return;
      }
      setOrder(orderResult.data);
      if (orderResult.data.motorId) {
        const motorResult = await getMotorById(orderResult.data.motorId);
        if (motorResult.success) setMotor(motorResult.data);
      }
      setIsLoading(false);
    };
    if (orderId) fetchData();
  }, [orderId]);

  // ==== Deteksi mode: pembayaran pertama atau pelunasan ====
  const isSettlement = order?.paymentStatus === "partial_paid" && order?.amountDue > 0;

  // ==== Handle Bayar (Midtrans) ====
  const handlePay = async () => {
    if (!order) return;
    setIsProcessing(true);
    setPaymentError("");

    try {
      const { data, error } = await supabase.functions.invoke("create-token", {
        body: { order_id: order.orderId },
      });

      if (error) throw new Error(error.message || "Gagal generate token");
      if (!data?.token) throw new Error("Token tidak diterima dari server");

      window.snap.pay(data.token, {
        onSuccess: (result) => {
          console.log("Payment success:", result);
          setIsSuccess(true);
          setIsProcessing(false);
          setTimeout(() => {
            navigate(`/invoice/${order.orderId}`);
          }, 1500);
        },
        onPending: (result) => {
          console.log("Payment pending:", result);
          alert("Pembayaran sedang diproses. Silakan selesaikan sesuai instruksi Midtrans.");
          setIsProcessing(false);
          navigate(`/riwayat/${order.id}`);
        },
        onError: (result) => {
          console.error("Payment error:", result);
          setPaymentError("Pembayaran gagal. Silakan coba lagi atau pilih metode lain.");
          setIsProcessing(false);
        },
        onClose: () => {
          console.log("Popup closed by user");
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error("Error:", err);
      setPaymentError(err.message || "Gagal memproses pembayaran.");
      setIsProcessing(false);
    }
  };

  // ==== Handle Simulasi (Demo) ====
  const handleSimulate = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "🟢 SIMULASI PEMBAYARAN (Untuk Demo)\n\n" +
      (isSettlement
        ? "Pelunasan akan ditandai LUNAS tanpa melalui Midtrans.\n\n"
        : "Pembayaran akan langsung ditandai LUNAS/DP tanpa melalui Midtrans.\n\n") +
      "Fitur ini khusus untuk DEMO saja.\n\nLanjutkan?"
    );
    if (!confirmed) return;

    setIsSimulating(true);
    setPaymentError("");

    try {
      const { data, error } = await supabase.functions.invoke("simulate-payment", {
        body: { order_id: order.orderId },
      });

      if (error) throw new Error(error.message || "Gagal simulasi");
      if (!data?.success) throw new Error(data?.error || "Simulasi gagal");

      alert("✅ Pembayaran berhasil disimulasikan! Mengalihkan ke invoice...");
      setTimeout(() => {
        navigate(`/invoice/${order.orderId}`);
      }, 800);
    } catch (err) {
      console.error("Simulate error:", err);
      setPaymentError(err.message || "Gagal simulasi pembayaran.");
      setIsSimulating(false);
    }
  };

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-white/60 text-sm">Memuat pesanan...</p>
      </div>
    );
  }

  // ===== NOT FOUND =====
  if (errorMsg || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-black text-white mb-2">Data pesanan tidak ditemukan</h1>
        <p className="text-white/60 mb-6">{errorMsg || "Pesanan tidak tersedia."}</p>
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

  // ===== Order dibatalkan =====
  if (order.rentalStatus === "dibatalkan") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-black text-white mb-2">Pesanan Sudah Dibatalkan</h1>
        <p className="text-white/60 mb-6">Pesanan ini tidak bisa dibayar karena sudah dibatalkan.</p>
        <Button
          variant="solid"
          size="medium"
          onClick={() => navigate("/riwayat")}
          className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
        >
          ← Kembali ke Riwayat
        </Button>
      </div>
    );
  }

  // ===== Sudah LUNAS =====
  if (order.paymentStatus === "paid") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-white mb-2">Pesanan Sudah Lunas</h1>
        <p className="text-white/60 mb-6">Pesanan ini sudah dibayar lunas.</p>
        <Button
          variant="solid"
          size="medium"
          onClick={() => navigate(`/invoice/${order.orderId}`)}
          className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none"
        >
          Lihat Invoice
        </Button>
      </div>
    );
  }

  // ==== Hitung jumlah bayar ====
  const amountToPay = isSettlement
    ? order.amountDue
    : (order.paymentType === "dp" ? Math.round(order.totalPrice * 0.5) : order.totalPrice);

  return (
    <div className="pb-16">
      {/* TOMBOL KEMBALI */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      </section>

      {/* HEADER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-4 ${
          isSettlement
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            : "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20"
        }`}>
          {isSettlement ? "Pelunasan Sisa" : "Konfirmasi Pembayaran"}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          {isSettlement ? (
            <>Bayar <span className="text-[#D4AF37]">Sisa Pembayaran</span></>
          ) : (
            <>Selesaikan <span className="text-[#D4AF37]">Pesananmu</span></>
          )}
        </h1>
        <p className="text-white/60 mt-2 text-sm md:text-base">
          {isSettlement
            ? "Selesaikan pelunasan untuk menyelesaikan sewa."
            : "Periksa kembali detail pesanan sebelum melanjutkan pembayaran."}
        </p>
      </section>

      {/* ERROR */}
      {paymentError && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 pb-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400">Pembayaran Gagal</p>
              <p className="text-xs text-red-300/80 mt-0.5">{paymentError}</p>
            </div>
          </div>
        </section>
      )}

      {/* KONTEN */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {/* Card Motor */}
            <div className="bg-[#15203D] rounded-2xl overflow-hidden border border-white/5">
              <div className="flex flex-col sm:flex-row gap-4 p-5">
                {motor?.image ? (
                  <img
                    src={motor.image}
                    alt={motor.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-xl bg-[#0B132B] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-full sm:w-32 h-32 rounded-xl bg-[#0B132B] flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🏍️</span>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wide">
                    Motor yang Disewa
                  </span>
                  <h3 className="font-black text-white text-lg">{motor?.name || "Motor"}</h3>
                  <p className="text-xs text-white/50">Order ID: {order.orderId}</p>
                </div>
              </div>
            </div>

            {/* Detail Sewa */}
            <div className="bg-[#15203D] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Detail Sewa</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Tanggal Mulai</p>
                  <p className="text-white font-medium">{order.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Durasi</p>
                  <p className="text-white font-medium">{order.durationDays} hari</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Metode Ambil</p>
                  <p className="text-white font-medium">
                    {order.pickupMethod === "delivery" ? "🏠 Diantar" : "🏍️ Ambil Sendiri"}
                  </p>
                </div>
              </div>
              {order.pickupMethod === "delivery" && order.deliveryAddress && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Alamat Pengantaran
                  </p>
                  <p className="text-sm text-white/80">{order.deliveryAddress}</p>
                </div>
              )}
            </div>

            {/* Data Penyewa */}
            <div className="bg-[#15203D] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Data Penyewa</h3>
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
                  <p className="text-xs text-white/50 mb-0.5">Identitas yang Ditahan</p>
                  <p className="text-white font-medium uppercase">
                    {order.identityType === "ktp" && "KTP"}
                    {order.identityType === "sim_c" && "SIM C"}
                    {order.identityType === "sim_a" && "SIM A"}
                    {order.identityType === "paspor" && "Paspor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-[#F9A826]/5 border border-[#F9A826]/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#F9A826] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#F9A826] mb-1">⚠️ Penting Diperhatikan</p>
                  <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
                    <li>Bawa identitas asli saat pengambilan motor (akan ditahan).</li>
                    {!isSettlement && (
                      <li>
                        {order.paymentType === "dp"
                          ? "Sisa pembayaran 50% dapat dibayar kapan saja sebelum pengambilan."
                          : "Pembayaran lunas, tidak ada sisa."}
                      </li>
                    )}
                    <li>Pembatalan H-3 akan hangus. Cek kebijakan refund.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* KANAN */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Rincian */}
              <div className="bg-[#15203D] rounded-2xl p-5 border border-[#D4AF37]/20">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 pb-3 border-b border-white/10">
                  💰 Rincian Pembayaran
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Total Sewa ({order.durationDays} hari)</span>
                    <span className="text-white font-medium">
                      Rp {order.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {isSettlement && (
                    <div className="flex justify-between text-white/70">
                      <span>Sudah Dibayar (DP)</span>
                      <span className="text-emerald-400 font-medium">
                        Rp {order.amountPaid.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">
                        {isSettlement ? "Sisa yang Harus Dibayar" : "Bayar Sekarang"}
                      </span>
                      <span className="text-[#D4AF37] font-black text-lg">
                        Rp {amountToPay.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {!isSettlement && order.paymentType === "dp" && (
                      <div className="flex justify-between text-xs text-white/50">
                        <span>Sisa (bisa dibayar nanti)</span>
                        <span>Rp {Math.round(order.totalPrice * 0.5).toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <span className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
                      isSettlement
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : order.paymentType === "dp"
                        ? "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {isSettlement
                        ? "🎯 Pelunasan"
                        : order.paymentType === "dp"
                        ? "📊 Metode: DP 50%"
                        : "✅ Metode: Full Payment"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metode */}
              <div className="bg-[#15203D] rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">
                  💳 Metode Tersedia
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-white/60 bg-[#0B132B] p-2 rounded-lg">
                    <QrCode className="w-4 h-4 text-[#D4AF37]" />
                    QRIS
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 bg-[#0B132B] p-2 rounded-lg">
                    <Wallet className="w-4 h-4 text-[#D4AF37]" />
                    GoPay
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 bg-[#0B132B] p-2 rounded-lg">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    Transfer
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 bg-[#0B132B] p-2 rounded-lg">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    Kartu
                  </div>
                </div>
              </div>

              {/* TOMBOL */}
              <div className="space-y-3">
                <Button
                  variant="solid"
                  size="large"
                  fullWidth
                  onClick={handlePay}
                  disabled={isProcessing || isSimulating || isSuccess}
                  className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-black border-none shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Berhasil! Mengalihkan...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Membuka Pembayaran...
                    </>
                  ) : (
                    <>💳 Bayar Real (Midtrans)</>
                  )}
                </Button>

                <p className="text-[10px] text-white/40 text-center leading-relaxed">
                  💡 Di Sandbox, hanya <strong className="text-white/60">Kartu Kredit</strong> yang bisa settle instan.
                  <br />
                  Untuk metode lain, pakai tombol simulasi.
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">atau</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  onClick={handleSimulate}
                  disabled={isProcessing || isSimulating || isSuccess}
                  className="w-full py-3 rounded-xl text-sm font-bold border-2 border-dashed border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Simulasi...
                    </>
                  ) : (
                    <>🟢 Simulasi Pembayaran (Demo)</>
                  )}
                </button>

                <p className="text-[10px] text-emerald-400/60 text-center leading-relaxed">
                  ⚠️ Tombol simulasi <strong>hanya untuk DEMO</strong>.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                <Shield className="w-3.5 h-3.5" />
                Pembayaran aman via Midtrans
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;