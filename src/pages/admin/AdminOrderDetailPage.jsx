// src/pages/admin/AdminOrderDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, Shield, Wallet,
  MapPin, User, Bike, AlertCircle, X, MessageCircle, Loader2, Package
} from "lucide-react";
import { getOrderById, updateOrder, calculateRefundPercentage } from "../../services/orderService";
import { formatRupiah } from "../../data/dummyStats";
import Button from "../../components/Button";

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMsg("");
      const orderResult = await getOrderById(id);
      if (!orderResult.success || !orderResult.data) {
        setErrorMsg("Pesanan tidak ditemukan.");
        setIsLoading(false);
        return;
      }
      setOrder(orderResult.data);
      setIsLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const handleAction = (action) => {
    setModalAction(action);
    setNote("");
    setActionError("");
  };

  const closeModal = () => {
    setModalAction(null);
    setNote("");
    setActionError("");
  };

  const confirmAction = async () => {
    if (!order) return;
    setIsProcessing(true);
    setActionError("");

    let updates = {};

    if (modalAction === "confirmDp") {
      const dpAmount = Math.round(order.totalPrice * 0.5);
      updates = {
        rentalStatus: "menunggu_verifikasi",
        paymentStatus: "partial_paid",
        amountPaid: dpAmount,
        amountDue: order.totalPrice - dpAmount,
      };
    } else if (modalAction === "confirmFull") {
      updates = {
        rentalStatus: "menunggu_verifikasi",
        paymentStatus: "paid",
        amountPaid: order.totalPrice,
        amountDue: 0,
      };
    } else if (modalAction === "cancelPending") {
      updates = {
        rentalStatus: "dibatalkan",
        cancelledAt: new Date().toISOString(),
        refundStatus: "none",
      };
    } else if (modalAction === "confirmOrder") {
      // Konfirmasi dari menunggu_verifikasi → dikonfirmasi
      updates = { rentalStatus: "dikonfirmasi" };
    } else if (modalAction === "reject") {
      const pct = calculateRefundPercentage(order.startDate);
      const refundAmount = Math.round((order.amountPaid || 0) * (pct / 100));
      updates = {
        rentalStatus: "dibatalkan",
        cancelledAt: new Date().toISOString(),
        refundAmount,
        refundStatus: refundAmount > 0 ? "pending" : "none",
        refundNote: note || "Ditolak oleh admin",
      };
    } else if (modalAction === "handoverMotor") {
      // Motor diserahkan ke user → aktif + identitas ditahan
      updates = {
        rentalStatus: "aktif",
        identityHeld: true,
      };
    } else if (modalAction === "markPaid") {
      updates = {
        amountPaid: order.totalPrice,
        amountDue: 0,
        paymentStatus: "paid",
      };
    } else if (modalAction === "complete") {
      // Motor dikembalikan → selesai + identitas dikembalikan
      updates = {
        rentalStatus: "selesai",
        identityHeld: false,
      };
    } else if (modalAction === "processRefund") {
      updates = {
        refundStatus: "processed",
        refundNote: note || "Transfer selesai",
        refundTransferredAt: new Date().toISOString(),
      };
    }

    const result = await updateOrder(order.id, updates);

    if (!result.success) {
      setActionError(result.error || "Gagal memperbarui pesanan.");
      setIsProcessing(false);
      return;
    }

    setOrder(result.data);
    setIsProcessing(false);
    closeModal();
  };

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Memuat detail pesanan...</p>
      </div>
    );
  }

  // ===== NOT FOUND =====
  if (errorMsg || !order) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-black text-[#0B132B] mb-2">Pesanan tidak ditemukan</h1>
        <p className="text-slate-500 mb-6">Order ID: {id}</p>
        <Button variant="solid" size="medium" onClick={() => navigate("/admin/orders")}
          className="bg-[#0B132B] text-white hover:bg-[#1a2a4a] font-bold border-none">
          ← Kembali ke Daftar Pesanan
        </Button>
      </div>
    );
  }

  const StatusBadge = ({ status, size = "md" }) => {
    const map = {
      pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
      menunggu_verifikasi: { label: "Menunggu Verifikasi", color: "bg-orange-100 text-orange-700 border-orange-200" },
      dikonfirmasi: { label: "Siap Diambil", color: "bg-blue-100 text-blue-700 border-blue-200" },
      aktif: { label: "Sedang Disewa", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      selesai: { label: "Selesai", color: "bg-slate-100 text-slate-600 border-slate-200" },
      dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-700 border-red-200" },
    };
    const s = map[status] || map.pending;
    const sizeClass = size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";
    return <span className={`inline-block font-bold rounded-full border ${s.color} ${sizeClass}`}>{s.label}</span>;
  };

  const buildTimeline = () => {
    const statusOrder = ["pending", "menunggu_verifikasi", "dikonfirmasi", "aktif", "selesai"];
    const currentIdx = statusOrder.indexOf(order.rentalStatus);
    const isCancelled = order.rentalStatus === "dibatalkan";

    const steps = [
      { key: "created", label: "Pesanan Dibuat", desc: new Date(order.createdAt).toLocaleDateString("id-ID"), done: true },
      {
        key: "paid",
        label: "Pembayaran",
        desc: order.paymentStatus === "paid" ? "Lunas" : order.paymentStatus === "partial_paid" ? "DP Dibayar" : "Belum Bayar",
        done: order.paymentStatus !== "unpaid",
      },
      { key: "verified", label: "Konfirmasi Admin", desc: currentIdx >= 2 ? "Dikonfirmasi" : "Menunggu", done: currentIdx >= 2 },
      { key: "active", label: "Motor Disewa", desc: currentIdx >= 3 ? "Berlangsung" : "—", done: currentIdx >= 3 },
      { key: "done", label: "Selesai", desc: currentIdx >= 4 ? "Dikembalikan" : "—", done: currentIdx >= 4 },
    ];

    return { steps, isCancelled };
  };

  const { steps, isCancelled } = buildTimeline();

  const getAvailableActions = () => {
    const actions = [];

    // Pending → admin konfirmasi pembayaran manual
    if (order.rentalStatus === "pending" && order.paymentStatus === "unpaid") {
      if (order.paymentType === "dp") {
        actions.push({
          id: "confirmDp",
          label: "Konfirmasi Pembayaran DP",
          icon: Wallet,
          color: "bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0B132B]",
        });
      } else {
        actions.push({
          id: "confirmFull",
          label: "Konfirmasi Pembayaran Lunas",
          icon: Wallet,
          color: "bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0B132B]",
        });
      }
      actions.push({
        id: "cancelPending",
        label: "Batalkan Pesanan",
        icon: XCircle,
        color: "bg-red-500 hover:bg-red-600 text-white",
      });
    }

    // Menunggu verifikasi → Konfirmasi / Tolak
    if (order.rentalStatus === "menunggu_verifikasi") {
      actions.push({
        id: "confirmOrder",
        label: "Konfirmasi Pesanan",
        icon: CheckCircle2,
        color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      });
      actions.push({
        id: "reject",
        label: "Tolak Pesanan",
        icon: XCircle,
        color: "bg-red-500 hover:bg-red-600 text-white",
      });
    }

    // Dikonfirmasi → Motor sudah diambil
    if (order.rentalStatus === "dikonfirmasi") {
      actions.push({
        id: "handoverMotor",
        label: "Motor Sudah Diambil",
        icon: Package,
        color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      });
    }

    // Aktif + DP belum lunas → Catat Pelunasan
    if (order.rentalStatus === "aktif" && order.paymentStatus === "partial_paid") {
      actions.push({
        id: "markPaid",
        label: "Catat Pelunasan",
        icon: Wallet,
        color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      });
    }

    // Aktif → Motor sudah dikembalikan
    if (order.rentalStatus === "aktif") {
      actions.push({
        id: "complete",
        label: "Motor Sudah Dikembalikan",
        icon: CheckCircle2,
        color: "bg-[#0B132B] hover:bg-[#1a2a4a] text-white",
      });
    }

    // Dibatalkan + refund pending → Proses Refund
    if (order.rentalStatus === "dibatalkan" && order.refundStatus === "pending") {
      actions.push({
        id: "processRefund",
        label: `Proses Refund ${formatRupiah(order.refundAmount)}`,
        icon: Wallet,
        color: "bg-[#FF6B35] hover:bg-[#e05a2a] text-white",
      });
    }

    return actions;
  };

  const actions = getAvailableActions();

  const getModalTitle = () => {
    const titles = {
      confirmDp: "Konfirmasi Pembayaran DP",
      confirmFull: "Konfirmasi Pembayaran Lunas",
      cancelPending: "Batalkan Pesanan",
      confirmOrder: "Konfirmasi Pesanan",
      reject: "Tolak Pesanan",
      handoverMotor: "Motor Sudah Diambil",
      markPaid: "Catat Pelunasan",
      complete: "Motor Sudah Dikembalikan",
      processRefund: "Proses Refund",
    };
    return titles[modalAction] || "Konfirmasi";
  };

  const getModalDescription = () => {
    const desc = {
      confirmDp: `Konfirmasi customer sudah membayar DP 50% (Rp ${Math.round(order.totalPrice * 0.5).toLocaleString("id-ID")}). Pesanan akan masuk antrean verifikasi.`,
      confirmFull: `Konfirmasi customer sudah membayar LUNAS (Rp ${order.totalPrice.toLocaleString("id-ID")}). Pesanan akan masuk antrean verifikasi.`,
      cancelPending: "Batalkan pesanan ini. Customer belum melakukan pembayaran, jadi tidak ada refund.",
      confirmOrder: "Pesanan ini sudah dikonfirmasi. Customer akan diberi tahu bahwa motor siap diambil.",
      reject: "Pesanan akan ditolak dan dibatalkan. Refund masuk antrean.",
      handoverMotor: "Tandai bahwa motor sudah diserahkan ke customer. Identitas akan ditandai sebagai DITAHAN, dan status pesanan menjadi AKTIF.",
      markPaid: "Catat pelunasan sisa pembayaran. Pastikan uang sudah diterima.",
      complete: "Tandai bahwa motor sudah dikembalikan oleh customer. Identitas akan dikembalikan, dan pesanan ditandai SELESAI.",
      processRefund: `Catat bahwa refund sebesar ${formatRupiah(order.refundAmount)} sudah ditransfer.`,
    };
    return desc[modalAction] || "";
  };

  return (
    <div className="space-y-6 pb-8">
      <button onClick={() => navigate("/admin/orders")}
        className="flex items-center gap-2 text-slate-500 hover:text-[#0B132B] transition-colors text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Pesanan
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
          <h1 className="text-xl md:text-2xl font-black text-[#0B132B] font-mono">{order.orderId}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{order.invoiceNumber}</p>
        </div>
        <StatusBadge status={order.rentalStatus} size="lg" />
      </div>

      {/* PANEL AKSI */}
      {actions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">⚡ Aksi Tersedia</p>
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.id} onClick={() => handleAction(action.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${action.color}`}>
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-6">📍 Timeline Pesanan</h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.done ? "bg-[#D4AF37] border-[#D4AF37] text-white" : "bg-white border-slate-200 text-slate-300"
                    }`}>
                      {step.done ? <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-8 ${step.done ? "bg-[#D4AF37]" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={`text-sm font-bold ${step.done ? "text-[#0B132B]" : "text-slate-400"}`}>{step.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {isCancelled && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Pesanan Dibatalkan</p>
                    {order.cancelledAt && (
                      <p className="text-xs text-red-600 mt-0.5">
                        Dibatalkan pada {new Date(order.cancelledAt).toLocaleDateString("id-ID")}
                      </p>
                    )}
                    {order.refundAmount > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        Refund: <span className="font-bold">{formatRupiah(order.refundAmount)}</span> •{" "}
                        Status: <span className="font-bold uppercase">{order.refundStatus}</span>
                      </p>
                    )}
                    {order.refundBankName && order.refundBankAccount && (
                      <p className="text-xs text-red-600 mt-0.5">
                        Rekening: <span className="font-bold">{order.refundBankName} - {order.refundBankAccount}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Motor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-4">🏍️ Motor yang Disewa</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {order.motorImage ? (
                <img src={order.motorImage} alt={order.motorName || "Motor"}
                  className="w-full sm:w-32 h-32 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop"; }} />
              ) : (
                <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Bike className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-black text-[#0B132B]">{order.motorName || "Motor tidak tersedia"}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Tanggal Mulai</p>
                    <p className="font-bold text-[#0B132B]">{order.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Durasi</p>
                    <p className="font-bold text-[#0B132B]">{order.durationDays} hari</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-4">👤 Data Penyewa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Nama Lengkap</p>
                <p className="font-bold text-[#0B132B]">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                <p className="font-medium text-[#0B132B] truncate">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">No WhatsApp</p>
                <p className="font-medium text-[#0B132B]">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Metode Pengambilan</p>
                <p className="font-bold text-[#0B132B]">
                  {order.pickupMethod === "delivery" ? "🏠 Diantar" : "🏍️ Ambil Sendiri"}
                </p>
              </div>
            </div>

            {order.pickupMethod === "delivery" && order.deliveryAddress && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Alamat Pengantaran
                </p>
                <p className="text-sm text-[#0B132B] font-medium mb-2">{order.deliveryAddress}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline">
                  🗺️ Buka di Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Identitas */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-4">🪪 Identitas</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Jenis Identitas</p>
                <p className="text-lg font-black text-[#0B132B] uppercase">
                  {order.identityType === "ktp" && "KTP"}
                  {order.identityType === "sim_c" && "SIM C"}
                  {order.identityType === "sim_a" && "SIM A"}
                  {order.identityType === "paspor" && "Paspor"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                {order.identityHeld ? (
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                    🟡 Sedang Ditahan
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    ✅ Belum Ditahan
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
                💰 Rincian Biaya
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Sewa</span>
                  <span className="font-bold text-[#0B132B]">{formatRupiah(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode</span>
                  <span className="font-bold text-[#0B132B] uppercase">
                    {order.paymentType === "dp" ? "DP 50%" : "Full"}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sudah Dibayar</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(order.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sisa</span>
                    <span className={`font-bold ${order.amountDue > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                      {formatRupiah(order.amountDue)}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  {order.paymentStatus === "paid" && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-600">LUNAS</span>
                    </div>
                  )}
                  {order.paymentStatus === "partial_paid" && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-bold text-orange-600">DP TERBAYAR</span>
                    </div>
                  )}
                  {order.paymentStatus === "unpaid" && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400">BELUM BAYAR</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📞 Hubungi Customer</p>
              <a href={`https://wa.me/${order.customerPhone.replace(/^0/, "62")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                <MessageCircle className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
                <span className="text-sm font-bold text-emerald-700">Chat via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg font-black text-[#0B132B]">{getModalTitle()}</h3>
              {!isProcessing && (
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-slate-600 leading-relaxed">{getModalDescription()}</p>

              {["reject", "processRefund"].includes(modalAction) && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Catatan {modalAction === "reject" ? "(alasan penolakan)" : "(opsional)"}
                  </label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none"
                    placeholder={modalAction === "reject" ? "Contoh: Jarak melebihi 5 km..." : "Contoh: TF ke BCA 1234 a.n. Customer"} />
                </div>
              )}

              {actionError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{actionError}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button onClick={closeModal} disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                Batal
              </button>
              <button onClick={confirmAction} disabled={isProcessing}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  modalAction === "reject" || modalAction === "cancelPending"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-[#0B132B] hover:bg-[#1a2a4a] text-white"
                }`}>
                {isProcessing ? (<><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>) : ("Konfirmasi")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetailPage;