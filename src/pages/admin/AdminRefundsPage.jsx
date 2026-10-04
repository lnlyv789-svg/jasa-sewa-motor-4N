// src/pages/admin/AdminRefundsPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Wallet, AlertCircle, CheckCircle2, X,
  ArrowRight, MessageCircle, FileText, Loader2, RefreshCw, Building2
} from "lucide-react";
import { getRefundOrders, processRefund } from "../../services/orderService";
import { formatRupiah } from "../../data/dummyStats";

const AdminRefundsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [refundTarget, setRefundTarget] = useState(null);
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchRefunds = async () => {
    setIsLoading(true);
    setErrorMsg("");
    const result = await getRefundOrders();
    if (!result.success) {
      setErrorMsg(result.error || "Gagal memuat data refund.");
      setIsLoading(false);
      return;
    }
    setOrders(result.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchRefunds(); }, []);

  const filteredRefunds = useMemo(() => {
    let list = [...orders];
    if (activeTab === "pending") list = list.filter((o) => o.refundStatus === "pending");
    else if (activeTab === "processed") list = list.filter((o) => o.refundStatus === "processed");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, activeTab, searchQuery]);

  const counts = useMemo(() => ({
    semua: orders.length,
    pending: orders.filter((o) => o.refundStatus === "pending").length,
    processed: orders.filter((o) => o.refundStatus === "processed").length,
  }), [orders]);

  const pendingAmount = useMemo(() => {
    return orders.filter((o) => o.refundStatus === "pending").reduce((s, o) => s + (o.refundAmount || 0), 0);
  }, [orders]);

  const handleOpenModal = (order) => {
    setRefundTarget(order);
    setNote("");
    setActionError("");
  };
  const closeModal = () => { setRefundTarget(null); setNote(""); setActionError(""); };

  const confirmRefund = async () => {
    if (!refundTarget) return;
    setIsProcessing(true);
    setActionError("");
    const result = await processRefund(refundTarget.id, {
      note: note.trim() || "Refund telah ditransfer",
      amount: refundTarget.refundAmount,
    });
    if (!result.success) {
      setActionError(result.error || "Gagal memproses refund.");
      setIsProcessing(false);
      return;
    }
    await fetchRefunds();
    setIsProcessing(false);
    closeModal();
  };

  const tabs = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "processed", label: "Selesai", count: counts.processed },
    { id: "semua", label: "Semua", count: counts.semua },
  ];

  const RefundStatusBadge = ({ status }) => {
    const map = {
      pending: { label: "Menunggu Refund", color: "bg-orange-100 text-orange-700 border-orange-200" },
      processed: { label: "Sudah Direfund", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      none: { label: "Tidak Ada Refund", color: "bg-slate-100 text-slate-600 border-slate-200" },
    };
    const s = map[status] || map.none;
    return <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0B132B]">Kelola Refund</h1>
        <p className="text-sm text-slate-500 mt-1">Proses pengembalian dana untuk pesanan yang dibatalkan.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-1">Gagal Memuat Refund</p>
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
          <button onClick={fetchRefunds} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200">
            <RefreshCw className="w-3.5 h-3.5" />Coba Lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-orange-600" strokeWidth={2.2} />
            </div>
            {counts.pending > 0 && (
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Perlu Aksi</span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">Refund Pending</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{counts.pending}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <Wallet className="w-5 h-5 text-red-600" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Total Nilai Pending</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{formatRupiah(pendingAmount)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Sudah Diproses</p>
          <p className="text-xl font-black text-[#0B132B] mt-1">{counts.processed}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Order ID atau nama customer..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id ? "bg-[#0B132B] text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}>
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? "bg-[#D4AF37] text-[#0B132B]" : "bg-slate-100 text-slate-500"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-10 h-10 text-[#D4AF37] mx-auto animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Memuat data refund...</p>
        </div>
      )}

      {!isLoading && !errorMsg && (
        <>
          {filteredRefunds.length > 0 ? (
            <div className="space-y-4">
              {filteredRefunds.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#0B132B] bg-slate-100 px-2.5 py-1 rounded">{order.orderId}</span>
                        <RefundStatusBadge status={order.refundStatus} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        <p className="text-slate-500">Customer: <span className="font-bold text-[#0B132B]">{order.customerName}</span></p>
                        <p className="text-slate-500">Email: <span className="text-slate-700">{order.customerEmail}</span></p>
                        <p className="text-slate-500">Motor: <span className="text-slate-700">{order.motorName || "-"}</span></p>
                        <p className="text-slate-500">Dibatalkan: <span className="text-slate-700">
                          {order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString("id-ID") : "—"}
                        </span></p>
                      </div>

                      {/* REKENING TUJUAN */}
                      {order.refundBankName && order.refundBankAccount && (
                        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-2">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">Rekening Tujuan</p>
                            <p className="text-xs text-blue-800 font-bold mt-0.5">
                              {order.refundBankName} - {order.refundBankAccount}
                            </p>
                          </div>
                        </div>
                      )}

                      {order.refundNote && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 mt-2">
                          <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span className="italic">"{order.refundNote}"</span>
                        </div>
                      )}
                    </div>

                    <div className="lg:text-right lg:min-w-[180px]">
                      <p className="text-xs text-slate-500 mb-1">Jumlah Refund</p>
                      <p className="text-2xl font-black text-[#FF6B35]">{formatRupiah(order.refundAmount)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">dari total {formatRupiah(order.amountPaid)}</p>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:min-w-[160px]">
                      <button onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="flex-1 lg:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-[#0B132B] hover:bg-slate-50 transition-all">
                        Lihat Pesanan
                      </button>
                      {order.refundStatus === "pending" ? (
                        <button onClick={() => handleOpenModal(order)}
                          className="flex-1 lg:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B35] text-white hover:bg-[#e05a2a] transition-all flex items-center justify-center gap-1">
                          Proses Refund<ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex-1 lg:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 text-center border border-emerald-200">
                          ✓ Selesai
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-[#0B132B] mb-1">
                {orders.length === 0 ? "Belum ada refund" : `Tidak ada refund ${activeTab === "pending" ? "yang perlu diproses" : ""}`}
              </h3>
              <p className="text-sm text-slate-500">
                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}".`
                  : orders.length === 0 ? "Semua pesanan masih aktif atau belum ada yang dibatalkan."
                  : "Semua refund sudah beres! 🎉"}
              </p>
            </div>
          )}
        </>
      )}

      {!isLoading && filteredRefunds.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          Menampilkan <span className="font-bold text-[#0B132B]">{filteredRefunds.length}</span> dari{" "}
          <span className="font-bold text-[#0B132B]">{orders.length}</span> refund
        </p>
      )}

      {/* MODAL PROSES REFUND */}
      {refundTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#FF6B35]" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0B132B]">Proses Refund</h3>
                  <p className="text-xs text-slate-500">{refundTarget.orderId}</p>
                </div>
              </div>
              {!isProcessing && (
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-bold text-[#0B132B]">{refundTarget.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">No HP</span>
                  <span className="font-medium text-[#0B132B]">{refundTarget.customerPhone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Jumlah Refund</span>
                  <span className="font-black text-[#FF6B35]">{formatRupiah(refundTarget.refundAmount)}</span>
                </div>
              </div>

              {/* REKENING TUJUAN */}
              {refundTarget.refundBankName && refundTarget.refundBankAccount ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" strokeWidth={2.2} />
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Rekening Tujuan Transfer</p>
                  </div>
                  <p className="text-sm font-black text-blue-900">{refundTarget.refundBankName}</p>
                  <p className="text-base font-black text-blue-900 mt-0.5">{refundTarget.refundBankAccount}</p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Customer belum mengisi rekening tujuan. Hubungi customer via WhatsApp untuk minta nomor rekening.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 leading-relaxed">
                  Pastikan sudah <strong>transfer manual</strong> ke rekening di atas sebelum klik "Tandai Selesai".
                </p>
              </div>

              <a
                href={`https://wa.me/${refundTarget.customerPhone.replace(/^0/, "62")}?text=${encodeURIComponent(
                  `Halo ${refundTarget.customerName}, refund untuk pesanan ${refundTarget.orderId} sebesar ${formatRupiah(refundTarget.refundAmount)} akan segera kami proses. Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                <MessageCircle className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
                <span className="text-sm font-bold text-emerald-700">Chat Customer via WhatsApp</span>
              </a>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan (opsional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none"
                  placeholder="Contoh: TF ke BCA 1234 a.n. Awan, 4 Okt 2026"
                />
              </div>

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
              <button onClick={confirmRefund} disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#FF6B35] hover:bg-[#e05a2a] text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessing ? (<><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>) : ("Tandai Selesai")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefundsPage;