// src/pages/user/InvoicePage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Printer, CheckCircle2, Bike, Info, Loader2, AlertCircle
} from "lucide-react";
import { toPng } from "html-to-image";
import { getOrderByOrderId } from "../../services/orderService";
import { supabase } from "../../lib/supabase";
import Button from "../../components/Button";

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // ==== Fetch order + payment ====
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg("");

      // 1. Fetch order
      const orderResult = await getOrderByOrderId(orderId);

      if (!orderResult.success || !orderResult.data) {
        setErrorMsg("Invoice tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      setOrder(orderResult.data);

      // 2. Fetch payment terbaru (untuk transaction_id & payment_method)
      const { data: paymentData } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (paymentData) setPayment(paymentData);

      setIsLoading(false);
    };

    if (orderId) fetchData();
  }, [orderId]);

  // ==== Handle download PNG ====
  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `Invoice-4N-${order.invoiceNumber.replace(/\//g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal download invoice:", err);
      alert("Gagal mengunduh invoice. Coba lagi ya!");
    } finally {
      setIsDownloading(false);
    }
  };

  // ==== Handle cetak ====
  const handlePrint = () => {
    window.print();
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-white/60 text-sm">Memuat invoice...</p>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================
  if (errorMsg || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🧾</div>
        <h1 className="text-2xl font-black text-white mb-2">Invoice tidak ditemukan</h1>
        <p className="text-white/60 mb-6">{errorMsg || "Invoice mungkin sudah dihapus."}</p>
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

  // ==== Status ====
  const isPaid = order.paymentStatus === "paid";
  const isPartial = order.paymentStatus === "partial_paid";
  const totalPaid = order.amountPaid || 0;
  const remaining = order.amountDue || 0;

  return (
    <div className="pb-16">
      {/* TOMBOL KEMBALI */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16 pt-8 print:hidden">
        <button
          onClick={() => navigate("/riwayat")}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Riwayat
        </button>
      </section>

      {/* HEADER SUKSES */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16 py-6 print:hidden">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-lg md:text-xl font-black text-white">
              Pembayaran {isPaid ? "Lunas" : isPartial ? "DP" : ""} Berhasil!
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Invoice sudah tersedia. Silakan download sebagai bukti pembayaran.
            </p>
          </div>
        </div>
      </section>

      {/* TOMBOL AKSI */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16 pb-6 print:hidden">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="solid"
            size="medium"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#D4AF37] text-[#0B132B] hover:bg-[#c29d2b] font-bold border-none disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Mengunduh..." : "Download Invoice (PNG)"}
          </Button>
          <Button
            variant="outline"
            size="medium"
            onClick={handlePrint}
            className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B132B]"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
        </div>
      </section>

      {/* INVOICE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16">
        <div
          ref={invoiceRef}
          className="bg-white text-[#0B132B] rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* HEADER INVOICE */}
          <div className="bg-[#0B132B] p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bike className="w-8 h-8 text-[#D4AF37]" />
                  <span className="text-2xl font-black tracking-tight">
                    4<span className="text-[#D4AF37]">N</span>
                  </span>
                </div>
                <p className="text-xs text-[#D4AF37]/70 mt-1">
                  Explore All Corners with 4N!
                </p>
              </div>

              <div className="text-left md:text-right">
                <h2 className="text-xl md:text-2xl font-black">INVOICE</h2>
                <p className="text-xs text-white/60 mt-1">{order.invoiceNumber}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* STATUS BANNER */}
          <div
            className={`px-6 md:px-8 py-3 text-sm font-bold ${
              isPaid
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isPaid ? "✅ LUNAS" : "🟡 PARTIAL PAID (DP 50%)"}
          </div>

          {/* BODY */}
          <div className="p-6 md:p-8 space-y-6">

            {/* Info Customer & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Ditagihkan Kepada
                </h3>
                <div className="space-y-1">
                  <p className="font-bold text-[#0B132B]">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                </div>
              </div>

              <div className="md:text-right">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Detail Pesanan
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Order ID: <span className="font-bold text-[#0B132B]">{order.orderId}</span>
                  </p>
                  <p className="text-gray-600">
                    Metode: <span className="font-bold text-[#0B132B] uppercase">{payment?.payment_type || "-"}</span>
                  </p>
                  <p className="text-gray-600">
                    Transaksi: <span className="font-mono text-xs text-[#0B132B]">{payment?.transaction_id || "-"}</span>
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Detail Sewa */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Detail Sewa
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Motor</span>
                  <span className="font-bold text-[#0B132B]">{order.motorName || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tanggal Mulai</span>
                  <span className="font-medium text-[#0B132B]">{order.startDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durasi</span>
                  <span className="font-medium text-[#0B132B]">{order.durationDays} hari</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Metode Pengambilan</span>
                  <span className="font-medium text-[#0B132B]">
                    {order.pickupMethod === "delivery" ? "Diantar" : "Ambil Sendiri"}
                  </span>
                </div>
                {order.pickupMethod === "delivery" && order.deliveryAddress && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-0.5">Alamat Pengantaran</p>
                    <p className="text-sm text-[#0B132B]">{order.deliveryAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rincian Biaya */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Rincian Biaya
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Sewa</span>
                  <span className="font-medium text-[#0B132B]">
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {isPaid ? "Dibayar (Full)" : "Dibayar (DP 50%)"}
                  </span>
                  <span className="font-medium text-emerald-600">
                    - Rp {totalPaid.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className={`mt-3 pt-3 border-t-2 border-dashed ${remaining > 0 ? "border-amber-300" : "border-emerald-300"}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0B132B]">
                      {remaining > 0 ? "Sisa Pembayaran" : "Total Dibayar"}
                    </span>
                    <span className={`text-xl font-black ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      Rp {(remaining > 0 ? remaining : totalPaid).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {remaining > 0 && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      * Dibayar saat pengambilan motor
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Identitas */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 mb-1">
                    Identitas yang Ditahan
                  </p>
                  <p className="text-sm text-amber-700 uppercase font-bold">
                    {order.identityType === "ktp" && "KTP"}
                    {order.identityType === "sim_c" && "SIM C"}
                    {order.identityType === "sim_a" && "SIM A"}
                    {order.identityType === "paspor" && "Paspor"}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Bawa identitas asli saat pengambilan motor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER INVOICE */}
          <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-[#0B132B]">
                Terima kasih telah mempercayai 4N! 🏍️
              </p>
              <p className="text-xs text-gray-500">
                Butuh bantuan? Hubungi kami di <span className="font-bold text-[#0B132B]">cs@4n.id</span> atau WA <span className="font-bold text-[#0B132B]">0811-1234-5678</span>
              </p>
              <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-200">
                Invoice ini adalah bukti pembayaran yang sah. Simpan dengan baik.
                <br />
                © {new Date().getFullYear()} 4N — Explore All Corners.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvoicePage;